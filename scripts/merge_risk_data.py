import argparse
from pathlib import Path

import pandas as pd


def normalize_fips(series: pd.Series) -> pd.Series:
    return series.astype(str).str.zfill(5)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--risk-csv",
        default="data/risk.csv",
        help="Path to risk.csv",
    )
    parser.add_argument(
        "--final-csv",
        default="data/final_df.csv",
        help="Path to final_df.csv",
    )
    parser.add_argument(
        "--risk-fips-col",
        default="State-County FIPS Code",
        help="FIPS column in risk.csv",
    )
    parser.add_argument(
        "--final-fips-col",
        default="fips_code",
        help="FIPS column in final_df.csv",
    )
    parser.add_argument(
        "--out-csv",
        default="data/combined_final.csv",
        help="Output path for merged CSV",
    )
    args = parser.parse_args()

    risk_path = Path(args.risk_csv)
    final_path = Path(args.final_csv)

    risk_df = pd.read_csv(risk_path)
    final_df = pd.read_csv(final_path)

    risk_df = risk_df.copy()
    final_df = final_df.copy()

    score_cols = [
        c for c in risk_df.columns
        if c.endswith(" - Hazard Type Risk Index Score")
    ]
    rating_cols = [
        c for c in risk_df.columns
        if c.endswith(" - Hazard Type Risk Index Rating")
    ]
    selected_cols = score_cols + rating_cols
    if not selected_cols:
        raise ValueError(
            "No columns found with suffixes ' - Hazard Type Risk Index Score' or "
            "' - Hazard Type Risk Index Rating'."
        )

    risk_df = risk_df[[args.risk_fips_col] + selected_cols]

    risk_df[args.risk_fips_col] = normalize_fips(risk_df[args.risk_fips_col])
    final_df[args.final_fips_col] = normalize_fips(final_df[args.final_fips_col])

    merged = final_df.merge(
        risk_df,
        left_on=args.final_fips_col,
        right_on=args.risk_fips_col,
        how="left",
    )

    out_path = Path(args.out_csv)
    out_path.parent.mkdir(parents=True, exist_ok=True)
    merged.to_csv(out_path, index=False)

    print(f"Merged rows: {len(merged)}")
    print(f"Output saved to: {out_path}")


if __name__ == "__main__":
    main()