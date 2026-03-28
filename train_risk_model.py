import argparse
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.metrics import mean_absolute_error, mean_squared_error
from sklearn.model_selection import GroupKFold
from sklearn.multioutput import MultiOutputRegressor
from sklearn.pipeline import Pipeline
from sklearn.ensemble import HistGradientBoostingRegressor


def find_target_columns(df: pd.DataFrame) -> list[str]:
    return [
        c for c in df.columns
        if c.endswith(" - Hazard Type Risk Index Value")
    ]


def coerce_numeric(df: pd.DataFrame, columns: list[str]) -> pd.DataFrame:
    df = df.copy()
    for c in columns:
        df[c] = pd.to_numeric(df[c], errors="coerce")
    return df


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--nri-csv", required=True, help="Path to NRI county CSV")
    parser.add_argument("--features-csv", required=True, help="Path to feature table CSV")
    parser.add_argument("--fips-col", default="State-County FIPS Code")
    parser.add_argument("--state-col", default="State Name Abbreviation")
    parser.add_argument("--out-model", default="risk_model.joblib")
    parser.add_argument("--out-metrics", default="risk_metrics.csv")
    args = parser.parse_args()

    nri = pd.read_csv(args.nri_csv)
    feats = pd.read_csv(args.features_csv)

    target_cols = find_target_columns(nri)
    if not target_cols:
        raise ValueError("No target columns found with suffix ' - Hazard Type Risk Index Value'.")

    # Ensure numeric targets
    nri = coerce_numeric(nri, target_cols)

    # Join on FIPS
    merged = nri[[args.fips_col, args.state_col] + target_cols].merge(
        feats,
        on=args.fips_col,
        how="inner",
    )

    # Drop rows with all targets missing
    merged = merged.dropna(subset=target_cols, how="all")

    # Features: everything from features file except FIPS
    feature_cols = [c for c in feats.columns if c != args.fips_col]

    X = merged[feature_cols]
    y = merged[target_cols]

    # Basic preprocessing: impute numeric columns
    numeric_cols = X.columns.tolist()
    preprocessor = ColumnTransformer(
        transformers=[
            ("num", SimpleImputer(strategy="median"), numeric_cols)
        ],
        remainder="drop",
    )

    base_model = HistGradientBoostingRegressor(
        loss="squared_error",
        max_depth=6,
        learning_rate=0.05,
        max_iter=300,
        random_state=42,
    )
    model = MultiOutputRegressor(base_model)

    pipe = Pipeline(steps=[
        ("prep", preprocessor),
        ("model", model),
    ])

    # Grouped CV by state to reduce spatial leakage
    groups = merged[args.state_col]
    gkf = GroupKFold(n_splits=5)

    metrics = []
    for fold, (train_idx, test_idx) in enumerate(gkf.split(X, y, groups=groups), start=1):
        X_train, X_test = X.iloc[train_idx], X.iloc[test_idx]
        y_train, y_test = y.iloc[train_idx], y.iloc[test_idx]

        pipe.fit(X_train, y_train)
        preds = pipe.predict(X_test)

        # Evaluate per target
        for i, col in enumerate(target_cols):
            y_true = y_test.iloc[:, i].values
            y_pred = preds[:, i]
            mae = mean_absolute_error(y_true, y_pred)
            rmse = mean_squared_error(y_true, y_pred, squared=False)
            metrics.append({
                "fold": fold,
                "target": col,
                "mae": mae,
                "rmse": rmse,
                "n": len(y_true),
            })

    metrics_df = pd.DataFrame(metrics)
    metrics_df.to_csv(args.out_metrics, index=False)

    # Fit final model on all data
    pipe.fit(X, y)
    joblib.dump(
        {
            "model": pipe,
            "feature_cols": feature_cols,
            "target_cols": target_cols,
        },
        args.out_model,
    )


if __name__ == "__main__":
    main()
