import pandas as pd
from pathlib import Path


def main() -> None:
    root = Path(__file__).resolve().parent.parent
    combined_path = root / "data" / "combined_final.csv"
    risk_path = root / "data" / "risk.csv"
    final_path = root / "data" / "final_df.csv"

    mapping = {
        "09100": "09001",
        "09110": "09003",
        "09120": "09001",
        "09130": "09007",
        "09140": "09009",
        "09150": "09007",
        "09160": "09013",
        "09170": "09005",
        "09180": "09011",
        "09190": "09001",
    }

    risk_df = pd.read_csv(risk_path)
    final_df = pd.read_csv(final_path)

    final_df["fips_code"] = final_df["fips_code"].astype(str).str.zfill(5)
    risk_df["State-County FIPS Code"] = (
        risk_df["State-County FIPS Code"].astype(str).str.zfill(5)
    )

    score_cols = [
        c for c in risk_df.columns if c.endswith(" - Hazard Type Risk Index Score")
    ]
    rating_cols = [
        c for c in risk_df.columns if c.endswith(" - Hazard Type Risk Index Rating")
    ]
    hazard_cols = score_cols + rating_cols

    risk_only = risk_df[["State-County FIPS Code"] + hazard_cols].copy()
    risk_only = risk_only.rename(columns={"State-County FIPS Code": "fips_code"})
    risk_only["fips_code"] = risk_only["fips_code"].map(lambda x: mapping.get(x, x))

    agg = {c: "mean" for c in score_cols}
    for c in rating_cols:
        agg[c] = lambda s: s.dropna().iloc[0] if len(s.dropna()) else None

    agg_hazards = risk_only.groupby("fips_code", as_index=False).agg(agg)

    out = final_df.merge(agg_hazards, on="fips_code", how="left")
    out.insert(len(final_df.columns), "State-County FIPS Code", out["fips_code"])

    ordered_cols = list(final_df.columns) + ["State-County FIPS Code"] + hazard_cols
    out = out[ordered_cols]

    out.to_csv(combined_path, index=False)
    print(f"Updated: {combined_path}")


if __name__ == "__main__":
    main()
