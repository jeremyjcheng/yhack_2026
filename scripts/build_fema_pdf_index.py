import argparse
import json
import os
from datetime import datetime, timezone
from pathlib import Path

import faiss
import numpy as np
import requests
from pypdf import PdfReader


def load_dotenv(path: Path) -> None:
    if not path.is_file():
        return
    for raw_line in path.read_text().splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        os.environ[key.strip()] = value.strip().strip('"').strip("'")


def normalize_whitespace(text: str) -> str:
    return " ".join(text.split())


def extract_pages(pdf_path: Path) -> list[dict[str, object]]:
    reader = PdfReader(str(pdf_path))
    pages: list[dict[str, object]] = []
    for idx, page in enumerate(reader.pages, start=1):
        text = page.extract_text() or ""
        text = normalize_whitespace(text)
        if not text:
            continue
        pages.append({"page": idx, "text": text})
    return pages


def split_chunks(
    pages: list[dict[str, object]],
    chunk_size: int,
    overlap: int,
) -> list[dict[str, object]]:
    chunks: list[dict[str, object]] = []
    chunk_id = 0
    step = max(1, chunk_size - overlap)

    for page in pages:
        text = str(page["text"])
        page_num = int(page["page"])
        if len(text) <= chunk_size:
            chunks.append(
                {"chunk_id": chunk_id, "page": page_num, "text": text}
            )
            chunk_id += 1
            continue

        start = 0
        while start < len(text):
            end = min(len(text), start + chunk_size)
            chunk_text = text[start:end].strip()
            if chunk_text:
                chunks.append(
                    {"chunk_id": chunk_id, "page": page_num, "text": chunk_text}
                )
                chunk_id += 1
            if end >= len(text):
                break
            start += step
    return chunks


def embed_text(
    text: str,
    api_key: str,
    model: str,
    timeout_seconds: int = 45,
) -> tuple[np.ndarray, str]:
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
            last_error = RuntimeError(f"Embedding model {candidate} failed: {resp.status_code} {resp.text[:200]}")
            continue
        data = resp.json()
        values = data.get("embedding", {}).get("values", [])
        if values:
            return np.asarray(values, dtype="float32"), candidate
        last_error = RuntimeError(f"Embedding model {candidate} returned empty vector")
    raise RuntimeError(str(last_error) if last_error else "Embedding failed")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--pdf-path",
        default="data/fema_national-risk-index_technical-documentation.pdf",
    )
    parser.add_argument("--out-index", default="data/FAISS/fema_pdf.index")
    parser.add_argument("--out-chunks", default="data/FAISS/fema_pdf_chunks.jsonl")
    parser.add_argument("--out-meta", default="data/FAISS/fema_pdf_meta.json")
    parser.add_argument("--model", default="gemini-embedding-001")
    parser.add_argument("--chunk-size", type=int, default=1000)
    parser.add_argument("--chunk-overlap", type=int, default=200)
    parser.add_argument("--max-chunks", type=int, default=0)
    args = parser.parse_args()

    repo_root = Path(__file__).resolve().parent.parent
    load_dotenv(repo_root / ".env")
    api_key = os.getenv("GEMINI_API_KEY", "").strip()
    if not api_key:
        raise RuntimeError("Missing GEMINI_API_KEY in environment or .env")

    pdf_path = (repo_root / args.pdf_path).resolve() if not Path(args.pdf_path).is_absolute() else Path(args.pdf_path)
    out_index = (repo_root / args.out_index).resolve() if not Path(args.out_index).is_absolute() else Path(args.out_index)
    out_chunks = (repo_root / args.out_chunks).resolve() if not Path(args.out_chunks).is_absolute() else Path(args.out_chunks)
    out_meta = (repo_root / args.out_meta).resolve() if not Path(args.out_meta).is_absolute() else Path(args.out_meta)

    pages = extract_pages(pdf_path)
    chunks = split_chunks(pages, chunk_size=args.chunk_size, overlap=args.chunk_overlap)
    if args.max_chunks > 0:
        chunks = chunks[: args.max_chunks]
    if not chunks:
        raise RuntimeError("No text chunks were extracted from PDF")

    vectors: list[np.ndarray] = []
    resolved_model = args.model
    for idx, chunk in enumerate(chunks, start=1):
        vector, used_model = embed_text(str(chunk["text"]), api_key=api_key, model=resolved_model)
        resolved_model = used_model
        vectors.append(vector)
        if idx % 25 == 0 or idx == len(chunks):
            print(f"Embedded {idx}/{len(chunks)} chunks")

    matrix = np.vstack(vectors).astype("float32")
    matrix = np.ascontiguousarray(matrix)
    faiss.normalize_L2(matrix)
    index = faiss.IndexFlatIP(matrix.shape[1])
    index.add(matrix)

    out_index.parent.mkdir(parents=True, exist_ok=True)
    faiss.write_index(index, str(out_index))

    with out_chunks.open("w", encoding="utf-8") as fp:
        for chunk in chunks:
            fp.write(json.dumps(chunk, ensure_ascii=True) + "\n")

    meta_payload = {
        "source_pdf": str(pdf_path),
        "embedding_model": resolved_model,
        "created_at_utc": datetime.now(timezone.utc).isoformat(),
        "chunk_size": args.chunk_size,
        "chunk_overlap": args.chunk_overlap,
        "num_chunks": len(chunks),
        "embedding_dim": int(matrix.shape[1]),
        "index_type": "IndexFlatIP",
        "normalized": True,
    }
    out_meta.write_text(json.dumps(meta_payload, indent=2), encoding="utf-8")

    print(f"Saved index: {out_index}")
    print(f"Saved chunks: {out_chunks}")
    print(f"Saved meta: {out_meta}")


if __name__ == "__main__":
    main()
