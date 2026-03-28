import argparse
import os
from pathlib import Path

import faiss
import numpy as np
import pandas as pd


FEATURE_COLS = [
    "avg_temp_max",
    "avg_temp_min",
    "avg_rain",
    "total_rain",
    "avg_uv_index",
    "max_uv_index",
    "total_snowfall",
    "avg_precip_hours",
    "total_precip_hours",
    "forecast_days",
]


def normalize_fips(value: str) -> str:
    return str(value).zfill(5)


def load_scaler(path: str) -> tuple[np.ndarray, np.ndarray]:
    data = np.load(path, allow_pickle=True).item()
    mean = np.asarray(data["mean"], dtype="float32")
    scale = np.asarray(data["scale"], dtype="float32")
    scale = np.where(scale == 0, 1.0, scale)
    return mean, scale


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--fips", required=True, help="County FIPS code to query")
    parser.add_argument("--data-csv", default="data/combined_final.csv")
    parser.add_argument("--index", default="data/FAISS/faiss.index")
    parser.add_argument("--metadata", default="data/FAISS/faiss_metadata.csv")
    parser.add_argument("--scaler", default="data/FAISS/faiss_scaler.npy")
    parser.add_argument("--k", type=int, default=5)
    parser.add_argument("--include-self", action="store_true")
    args = parser.parse_args()

    data_path = Path(args.data_csv)
    metadata_path = Path(args.metadata)

    df = pd.read_csv(data_path)
    meta = pd.read_csv(metadata_path)

    query_fips = normalize_fips(args.fips)
    if "fips_code" not in df.columns:
        raise ValueError("combined_final.csv must include 'fips_code'.")

    df = df.copy()
    df["fips_code"] = df["fips_code"].astype(str).str.zfill(5)

    row = df.loc[df["fips_code"] == query_fips]
    if row.empty:
        raise ValueError(f"FIPS {query_fips} not found in combined_final.csv.")

    selected = row.iloc[0]
    selected_summary = {
        "fips_code": selected.get("fips_code"),
        "name": selected.get("name"),
        "state": selected.get("state"),
        "lat": selected.get("lat"),
        "lon": selected.get("lon"),
    }
    print("Selected county:")
    for key, value in selected_summary.items():
        print(f"  {key}: {value}")

    missing = [c for c in FEATURE_COLS if c not in df.columns]
    if missing:
        raise ValueError(f"Missing feature columns: {missing}")

    os.environ.setdefault("KMP_DUPLICATE_LIB_OK", "TRUE")
    x = selected[FEATURE_COLS].infer_objects(copy=False).fillna(0).to_numpy(dtype="float32")

    mean, scale = load_scaler(args.scaler)
    x = (x - mean) / scale
    x = np.ascontiguousarray(x.reshape(1, -1).astype("float32"))
    faiss.normalize_L2(x)

    index = faiss.read_index(args.index)
    distances, indices = index.search(x, args.k + (0 if args.include_self else 1))

    results = []
    for rank, idx in enumerate(indices[0]):
        if idx < 0:
            continue
        if not args.include_self:
            candidate_fips = normalize_fips(meta.iloc[idx].get("fips_code", ""))
            if candidate_fips == query_fips:
                continue
        similarity = float(distances[0][rank])
        results.append((idx, similarity))
        if len(results) >= args.k:
            break

    output_rows = []
    for idx, similarity in results:
        row_meta = meta.iloc[idx].to_dict()
        row_meta["similarity"] = similarity
        output_rows.append(row_meta)

    out_df = pd.DataFrame(output_rows)
    print(out_df.to_string(index=False))


if __name__ == "__main__":
    main()
