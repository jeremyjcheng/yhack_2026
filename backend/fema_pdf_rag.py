from __future__ import annotations

import json
import os
import re
from functools import lru_cache
from pathlib import Path
from typing import Any

import faiss
import numpy as np
import requests


DEFAULT_INDEX_PATH = "data/FAISS/fema_pdf.index"
DEFAULT_CHUNKS_PATH = "data/FAISS/fema_pdf_chunks.jsonl"
DEFAULT_META_PATH = "data/FAISS/fema_pdf_meta.json"
DEFAULT_EMBED_MODEL = "gemini-embedding-001"
DEFAULT_GENERATE_MODEL = "gemini-3-flash-preview"


def load_dotenv(path: Path) -> None:
    if not path.is_file():
        return
    for raw_line in path.read_text().splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        os.environ[key.strip()] = value.strip().strip('"').strip("'")


def _extract_json_object(text: str) -> dict[str, Any] | None:
    text = text.strip()
    if not text:
        return None

    fenced = re.search(r"```(?:json)?\s*(\{.*\})\s*```", text, flags=re.S)
    candidate = fenced.group(1) if fenced else text

    try:
        payload = json.loads(candidate)
        return payload if isinstance(payload, dict) else None
    except json.JSONDecodeError:
        pass

    start = text.find("{")
    end = text.rfind("}")
    if start >= 0 and end > start:
        try:
            payload = json.loads(text[start : end + 1])
            return payload if isinstance(payload, dict) else None
        except json.JSONDecodeError:
            return None
    return None


@lru_cache(maxsize=1)
def load_index_bundle(
    index_path: str,
    chunks_path: str,
    meta_path: str,
) -> tuple[faiss.Index, list[dict[str, Any]], dict[str, Any]]:
    index_file = Path(index_path)
    chunks_file = Path(chunks_path)
    meta_file = Path(meta_path)

    missing = [str(p) for p in (index_file, chunks_file, meta_file) if not p.exists()]
    if missing:
        raise FileNotFoundError(
            "Missing FEMA RAG artifacts. Run scripts/build_fema_pdf_index.py first. "
            f"Missing: {missing}"
        )

    index = faiss.read_index(str(index_file))
    chunks: list[dict[str, Any]] = []
    with chunks_file.open("r", encoding="utf-8") as fp:
        for line in fp:
            record = json.loads(line)
            chunks.append(record)
    if not chunks:
        raise RuntimeError("fema_pdf_chunks.jsonl is empty")
    if index.ntotal != len(chunks):
        raise RuntimeError(
            f"Index/chunk mismatch: index.ntotal={index.ntotal}, chunks={len(chunks)}"
        )

    meta = json.loads(meta_file.read_text(encoding="utf-8"))
    return index, chunks, meta


def embed_text(
    *,
    text: str,
    api_key: str,
    model: str,
    timeout_seconds: int = 45,
) -> np.ndarray:
    candidate_models = [model]
    if model != "gemini-embedding-001":
        candidate_models.append("gemini-embedding-001")
    if model != "text-embedding-004":
        candidate_models.append("text-embedding-004")

    last_error: Exception | None = None
    for candidate in candidate_models:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{candidate}:embedContent"
        payload = {"content": {"parts": [{"text": text}]}}
        resp = requests.post(url, params={"key": api_key}, json=payload, timeout=timeout_seconds)
        if not resp.ok:
            last_error = RuntimeError(
                f"Embedding model {candidate} failed: {resp.status_code} {resp.text[:200]}"
            )
            continue
        data = resp.json()
        values = data.get("embedding", {}).get("values", [])
        if values:
            return np.asarray(values, dtype="float32")
        last_error = RuntimeError(f"Embedding model {candidate} returned empty vector")
    raise RuntimeError(str(last_error) if last_error else "Embedding failed")


def call_gemini_json(
    *,
    prompt: str,
    api_key: str,
    model: str = DEFAULT_GENERATE_MODEL,
    timeout_seconds: int = 45,
) -> dict[str, Any] | None:
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"
    payload = {"contents": [{"role": "user", "parts": [{"text": prompt}]}]}
    resp = requests.post(url, params={"key": api_key}, json=payload, timeout=timeout_seconds)
    if not resp.ok:
        return None
    data = resp.json()
    candidates = data.get("candidates", [])
    if not candidates:
        return None
    parts = candidates[0].get("content", {}).get("parts", [])
    raw_text = "".join(part.get("text", "") for part in parts)
    return _extract_json_object(raw_text)


def retrieve_chunks(
    *,
    question: str,
    api_key: str,
    index: faiss.Index,
    chunks: list[dict[str, Any]],
    embedding_model: str,
    top_k: int = 6,
) -> list[dict[str, Any]]:
    vector = embed_text(text=question, api_key=api_key, model=embedding_model)
    query = np.ascontiguousarray(vector.reshape(1, -1).astype("float32"))
    faiss.normalize_L2(query)

    distances, indices = index.search(query, top_k)
    results: list[dict[str, Any]] = []
    for rank, idx in enumerate(indices[0]):
        if idx < 0:
            continue
        chunk = chunks[idx]
        results.append(
            {
                "chunk_id": int(chunk.get("chunk_id", idx)),
                "page": int(chunk.get("page", -1)),
                "text": str(chunk.get("text", "")),
                "similarity": float(distances[0][rank]),
            }
        )
    return results


def build_prompt(
    *,
    question: str,
    retrieved_chunks: list[dict[str, Any]],
    history: list[dict[str, str]] | None = None,
) -> str:
    clipped_history = (history or [])[-6:]
    evidence = [
        {
            "chunk_id": item["chunk_id"],
            "page": item["page"],
            "similarity": round(item["similarity"], 4),
            "excerpt": item["text"][:1400],
        }
        for item in retrieved_chunks
    ]
    return (
        "You are a technical assistant for FEMA National Risk Index methodology.\n"
        "Answer ONLY from the provided excerpts from the official FEMA PDF.\n"
        "If the excerpts do not support an answer, state that explicitly.\n\n"
        "Return STRICT JSON with keys:\n"
        '- "answer": string\n'
        '- "citations": array of short strings referencing page/chunk ids\n'
        '- "debug_context": object\n\n'
        "Do not invent equations, data points, or definitions not present in excerpts.\n\n"
        f"Conversation history:\n{json.dumps(clipped_history, ensure_ascii=True)}\n\n"
        f"Evidence excerpts:\n{json.dumps(evidence, ensure_ascii=True)}\n\n"
        f"User question:\n{question}\n"
    )


def deterministic_fallback(question: str, retrieved_chunks: list[dict[str, Any]]) -> dict[str, Any]:
    if not retrieved_chunks:
        return {
            "answer": (
                "I could not retrieve supporting FEMA PDF passages for this question. "
                "Try rephrasing with specific terms from the documentation."
            ),
            "citations": ["No retrieved FEMA PDF chunks"],
            "debug_context": {"fallback": True, "reason": "no_retrieval", "question": question},
        }

    lead = retrieved_chunks[0]
    answer = (
        "I found relevant FEMA documentation excerpts, but the model response was unavailable. "
        f"Top retrieved context is from page {lead.get('page')} (chunk {lead.get('chunk_id')})."
    )
    citations = [
        f"page {item.get('page')} chunk {item.get('chunk_id')}"
        for item in retrieved_chunks[:3]
    ]
    return {
        "answer": answer,
        "citations": citations,
        "debug_context": {"fallback": True, "reason": "model_unavailable_or_invalid"},
    }


def answer_from_fema_pdf(
    *,
    repo_root: Path,
    question: str,
    history: list[dict[str, str]] | None = None,
    top_k: int = 6,
) -> dict[str, Any]:
    if not question.strip():
        raise ValueError("question is required")

    load_dotenv(repo_root / ".env")
    api_key = os.getenv("GEMINI_API_KEY", "").strip()
    if not api_key:
        return {
            "answer": "Missing GEMINI_API_KEY; cannot run FEMA PDF RAG.",
            "citations": [],
            "debug_context": {"fallback": True, "reason": "missing_gemini_api_key"},
        }

    index_path = repo_root / DEFAULT_INDEX_PATH
    chunks_path = repo_root / DEFAULT_CHUNKS_PATH
    meta_path = repo_root / DEFAULT_META_PATH
    index, chunks, meta = load_index_bundle(
        str(index_path),
        str(chunks_path),
        str(meta_path),
    )
    embedding_model = str(meta.get("embedding_model") or DEFAULT_EMBED_MODEL)
    retrieved = retrieve_chunks(
        question=question,
        api_key=api_key,
        index=index,
        chunks=chunks,
        embedding_model=embedding_model,
        top_k=top_k,
    )
    prompt = build_prompt(question=question, retrieved_chunks=retrieved, history=history)
    model_payload = call_gemini_json(prompt=prompt, api_key=api_key)
    if not model_payload:
        result = deterministic_fallback(question, retrieved)
        result["debug_context"]["retrieved"] = [
            {"page": item["page"], "chunk_id": item["chunk_id"]} for item in retrieved
        ]
        return result

    answer = str(model_payload.get("answer", "")).strip()
    citations_raw = model_payload.get("citations", [])
    if not isinstance(citations_raw, list):
        citations_raw = []
    citations = [str(item).strip() for item in citations_raw if str(item).strip()]
    has_page_refs = any("page" in item.lower() for item in citations)
    if not citations or not has_page_refs:
        citations = [
            f"page {item['page']} chunk {item['chunk_id']}" for item in retrieved[:3]
        ]

    debug_context = model_payload.get("debug_context", {})
    if not isinstance(debug_context, dict):
        debug_context = {}

    if not answer:
        return deterministic_fallback(question, retrieved)

    return {
        "answer": answer,
        "citations": citations,
        "debug_context": {
            **debug_context,
            "fallback": False,
            "retrieved": [
                {"page": item["page"], "chunk_id": item["chunk_id"], "similarity": item["similarity"]}
                for item in retrieved
            ],
        },
    }
