import argparse
from pathlib import Path

import faiss
import numpy as np
import pandas as pd
from sklearn.preprocessing import StandardScaler


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


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--data-csv", default="data/combined_final.csv")
    parser.add_argument("--out-index", default="data/faiss.index")
    parser.add_argument("--out-metadata", default="data/faiss_metadata.csv")
    parser.add_argument("--out-scaler", default="data/faiss_scaler.npy")
    args = parser.parse_args()

    df = pd.read_csv(args.data_csv)

    missing = [c for c in FEATURE_COLS if c not in df.columns]
    if missing:
        raise ValueError(f"Missing feature columns: {missing}")

    X = df[FEATURE_COLS].fillna(0).to_numpy().astype("float32")

    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X).astype("float32")
    X_scaled = np.ascontiguousarray(X_scaled)

    # Cosine similarity via inner product on unit-normalized vectors
    faiss.normalize_L2(X_scaled)
    dim = X_scaled.shape[1]
    index = faiss.IndexFlatIP(dim)
    index.add(X_scaled)

    Path(args.out_index).parent.mkdir(parents=True, exist_ok=True)
    faiss.write_index(index, args.out_index)

    # Save metadata for lookup after NN search
    metadata_cols = [c for c in ["fips_code", "name", "state", "lat", "lon"] if c in df.columns]
    df[metadata_cols].to_csv(args.out_metadata, index=False)

    np.save(args.out_scaler, {"mean": scaler.mean_, "scale": scaler.scale_})

    print(f"Index size: {index.ntotal}")
    print(f"Saved index to: {args.out_index}")
    print(f"Saved metadata to: {args.out_metadata}")
    print(f"Saved scaler to: {args.out_scaler}")


if __name__ == "__main__":
    main()
