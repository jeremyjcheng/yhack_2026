from __future__ import annotations

import json
import os
import re
from functools import lru_cache
from pathlib import Path
from typing import Any

import faiss
import numpy as np
import pandas as pd
import requests


HEAT_COL = "Heat Wave - Hazard Type Risk Index Score"
INLAND_FLOOD_COL = "Inland Flooding - Hazard Type Risk Index Score"
COASTAL_FLOOD_COL = "Coastal Flooding - Hazard Type Risk Index Score"
HURRICANE_COL = "Hurricane - Hazard Type Risk Index Score"
WILDFIRE_COL = "Wildfire - Hazard Type Risk Index Score"
DROUGHT_COL = "Drought - Hazard Type Risk Index Score"

RISK_COLUMNS = [
    HEAT_COL, INLAND_FLOOD_COL, COASTAL_FLOOD_COL,
    HURRICANE_COL, WILDFIRE_COL, DROUGHT_COL,
]

DEFAULT_COUNTY_CSV = "data/final_df.csv"
DEFAULT_RISK_CSV = "data/risk.csv"
DEFAULT_INDEX_PATH = "data/FAISS/fema_pdf.index"
DEFAULT_CHUNKS_PATH = "data/FAISS/fema_pdf_chunks.jsonl"
DEFAULT_META_PATH = "data/FAISS/fema_pdf_meta.json"
DEFAULT_EMBED_MODEL = "gemini-embedding-001"
DEFAULT_GENERATE_MODEL = "gemini-3-flash-preview"

DEMOGRAPHIC_COLS = [
    "Population (2020)",
    "Building Value ($)",
    "Agriculture Value ($)",
    "Area (sq mi)",
    "National Risk Index - Score - Composite",
    "National Risk Index - Rating - Composite",
    "Expected Annual Loss - Total - Composite",
    "Social Vulnerability - Score",
    "Community Resilience - Score",
]


def load_dotenv(path: Path) -> None:
    if not path.is_file():
        return
    for raw_line in path.read_text().splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        os.environ[key.strip()] = value.strip().strip('"').strip("'")


@lru_cache(maxsize=1)
def load_county_data(csv_path: str) -> pd.DataFrame:
    df = pd.read_csv(csv_path)
    normalized = df.copy()
    normalized["fips_code"] = normalized["fips_code"].astype(str).str.zfill(5)
    if "name" not in normalized.columns:
        normalized["name"] = ""
    if "state" not in normalized.columns:
        normalized["state"] = ""
    normalized["name"] = normalized["name"].astype(str)
    normalized["state"] = normalized["state"].astype(str)
    normalized["_name_norm"] = normalized["name"].str.lower().str.strip()
    normalized["_state_norm"] = normalized["state"].str.lower().str.strip()
    return normalized


def _hazard_to_unit(value: object) -> float:
    try:
        n = float(value)  # type: ignore[arg-type]
    except (TypeError, ValueError):
        return 0.0
    if n != n:
        return 0.0
    return max(0.0, min(1.0, n / 100.0))


def _weighted_avg(entries: list[tuple[float, float]]) -> float:
    valid = [(v, w) for v, w in entries if w > 0]
    if not valid:
        return 0.0
    return sum(v * w for v, w in valid) / sum(w for _, w in valid)


def compute_risk_breakdown(row: pd.Series) -> dict[str, object]:
    heat = _hazard_to_unit(row.get(HEAT_COL))
    inland = _hazard_to_unit(row.get(INLAND_FLOOD_COL))
    coastal = _hazard_to_unit(row.get(COASTAL_FLOOD_COL))
    hurricane = _hazard_to_unit(row.get(HURRICANE_COL))
    wildfire_raw = _hazard_to_unit(row.get(WILDFIRE_COL))
    drought = _hazard_to_unit(row.get(DROUGHT_COL))

    flood = _weighted_avg([(inland, 0.6), (coastal, 0.2), (hurricane, 0.2)])
    wildfire = _weighted_avg([(wildfire_raw, 0.8), (drought, 0.2)])
    overall = (heat + flood + wildfire) / 3.0

    return {
        "heat": round(heat, 4),
        "flood": round(flood, 4),
        "wildfire": round(wildfire, 4),
        "overall": round(overall, 4),
        "components": {
            "heat_wave_score": round(row.get(HEAT_COL, 0) or 0, 2),
            "inland_flood_score": round(row.get(INLAND_FLOOD_COL, 0) or 0, 2),
            "coastal_flood_score": round(row.get(COASTAL_FLOOD_COL, 0) or 0, 2),
            "hurricane_score": round(row.get(HURRICANE_COL, 0) or 0, 2),
            "wildfire_score": round(row.get(WILDFIRE_COL, 0) or 0, 2),
            "drought_score": round(row.get(DROUGHT_COL, 0) or 0, 2),
        },
    }


def resolve_counties(
    df: pd.DataFrame,
    question: str,
    county: str | None = None,
    state: str | None = None,
    fips: str | None = None,
    limit: int = 3,
    risk_df: pd.DataFrame | None = None,
) -> list[dict[str, object]]:
    if fips:
        hit = df.loc[df["fips_code"] == str(fips).strip().zfill(5)]
        if not hit.empty:
            return [_county_evidence(hit.iloc[0], risk_df)]

    filtered = df
    if county:
        cn = county.lower().strip().replace(" county", "")
        filtered = filtered.loc[filtered["_name_norm"].str.contains(cn, na=False)]
    if state:
        sn = state.lower().strip()
        filtered = filtered.loc[filtered["_state_norm"] == sn]
    if not filtered.empty:
        return [
            _county_evidence(filtered.iloc[i], risk_df)
            for i in range(min(limit, len(filtered)))
        ]

    q_lower = question.lower()
    for _, row in df.iterrows():
        name = str(row.get("_name_norm", ""))
        st = str(row.get("_state_norm", ""))
        if name and len(name) > 2 and name in q_lower and st in q_lower:
            return [_county_evidence(row, risk_df)]

    return []


@lru_cache(maxsize=1)
def load_risk_data(csv_path: str) -> pd.DataFrame:
    p = Path(csv_path)
    if not p.is_file():
        return pd.DataFrame()
    df = pd.read_csv(csv_path, encoding="utf-8", encoding_errors="replace")
    fips_col = "State-County FIPS Code"
    if fips_col in df.columns:
        df["_fips_norm"] = df[fips_col].astype(str).str.zfill(5)
    return df


def _get_demographics(fips: str, risk_df: pd.DataFrame) -> dict[str, object]:
    if risk_df.empty or "_fips_norm" not in risk_df.columns:
        return {}
    hit = risk_df.loc[risk_df["_fips_norm"] == str(fips).zfill(5)]
    if hit.empty:
        return {}
    row = hit.iloc[0]
    demo: dict[str, object] = {}
    for col in DEMOGRAPHIC_COLS:
        if col in row.index:
            val = row[col]
            try:
                demo[col] = round(float(val), 2)
            except (TypeError, ValueError):
                demo[col] = str(val) if pd.notna(val) else None
    hazard_details: dict[str, object] = {}
    for col in row.index:
        if any(kw in str(col) for kw in [
            "Exposure -", "Expected Annual Loss -",
            "Annualized Frequency", "Historic Loss Ratio",
        ]):
            val = row[col]
            try:
                hazard_details[str(col)] = round(float(val), 4)
            except (TypeError, ValueError):
                pass
    if hazard_details:
        demo["hazard_details"] = hazard_details
    return demo


def _county_evidence(
    row: pd.Series,
    risk_df: pd.DataFrame | None = None,
) -> dict[str, object]:
    risk = compute_risk_breakdown(row)
    all_scores: dict[str, object] = {}
    for col in row.index:
        if "Hazard Type Risk Index" in str(col):
            val = row[col]
            try:
                all_scores[str(col)] = round(float(val), 2)
            except (TypeError, ValueError):
                pass
    fips = str(row.get("fips_code", ""))
    evidence: dict[str, object] = {
        "fips_code": fips,
        "name": str(row.get("name", "")),
        "state": str(row.get("state", "")),
        "lat": row.get("lat"),
        "lon": row.get("lon"),
        "all_hazard_scores": all_scores,
        "derived_risk": risk,
    }
    if risk_df is not None and not risk_df.empty:
        demographics = _get_demographics(fips, risk_df)
        if demographics:
            evidence["demographics"] = demographics
    return evidence


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
    county_evidence: list[dict[str, object]] | None = None,
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

    county_block = ""
    if county_evidence:
        county_block = (
            "County-level data (actual values from the National Risk Index dataset):\n"
            f"{json.dumps(county_evidence, ensure_ascii=True, default=str)}\n\n"
        )

    return (
        "You are a technical assistant for the FEMA National Risk Index.\n"
        "You have two sources of information:\n"
        "1. Excerpts from the official FEMA NRI technical documentation (methodology, "
        "equations, definitions).\n"
        "2. Actual county-level hazard scores and derived risk values from the NRI dataset.\n\n"
        "Use BOTH sources to answer. When county data is provided, analyze the actual "
        "scores to explain why a county has high or low risk. Infer causes from the "
        "data -- for example, if a heat wave score is low relative to neighboring "
        "counties, consider population, exposure, building value, and agricultural "
        "value as factors (these drive the Expected Annual Loss that feeds the score). "
        "Combine your understanding of the FEMA methodology with the real numbers to "
        "give an insightful, data-backed answer.\n\n"
        "If the county data shows a specific pattern (e.g. very low score), explain "
        "the likely reasons using the methodology (population, exposure, consequence "
        "types, annualized frequency, historic loss ratio, etc.).\n\n"
        "Response style:\n"
        "- Be simple, straightforward, concise, direct, and accurate.\n"
        "- Format your answer as exactly 4-5 bullet points.\n"
        "- Each bullet must start with the Unicode bullet character '\u2022 ' (U+2022 followed by a space).\n"
        "- Each bullet point must be exactly ONE short sentence (no more than ~25 words).\n"
        "- Do not include citations, sources, or page references in the answer text.\n\n"
        "Return STRICT JSON with keys:\n"
        '- "answer": string (4-5 bullet points separated by newlines, each starting with \u2022)\n'
        '- "citations": empty array []\n'
        '- "debug_context": object\n\n'
        f"Conversation history:\n{json.dumps(clipped_history, ensure_ascii=True)}\n\n"
        f"{county_block}"
        f"FEMA documentation excerpts:\n{json.dumps(evidence, ensure_ascii=True)}\n\n"
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
    county: str | None = None,
    state: str | None = None,
    fips: str | None = None,
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

    county_csv = repo_root / DEFAULT_COUNTY_CSV
    risk_csv = repo_root / DEFAULT_RISK_CSV
    county_evidence: list[dict[str, object]] = []
    if county_csv.is_file():
        try:
            county_df = load_county_data(str(county_csv))
            risk_df = load_risk_data(str(risk_csv)) if risk_csv.is_file() else pd.DataFrame()
            county_evidence = resolve_counties(
                county_df,
                question,
                county=county,
                state=state,
                fips=fips,
                risk_df=risk_df,
            )
        except Exception:
            county_evidence = []

    prompt = build_prompt(
        question=question,
        retrieved_chunks=retrieved,
        county_evidence=county_evidence,
        history=history,
    )
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
