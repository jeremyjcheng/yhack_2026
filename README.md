# Climate Risk Advisor

Climate Risk Advisor is an interactive web application for exploring county-level climate risk across the United States. It combines county climate features, hazard index scores, and map-based exploration to help users understand relative risk patterns for heat, flood, and wildfire.

The repository includes:

- A React + Vite frontend with an interactive county map and analytics dashboards.
- A Python FastAPI backend endpoint for county-to-Gemini recommendations.
- A small Python data-processing workflow to merge source datasets.
- Optional FAISS-based nearest-neighbor indexing and querying for similar-county analysis.

## Table of Contents

- [Project Overview](#project-overview)
- [Core Features](#core-features)
- [Tech Stack](#tech-stack)
- [Repository Structure](#repository-structure)
- [Prerequisites](#prerequisites)
- [Environment Variables](#environment-variables)
- [Quick Start](#quick-start)
- [Data Workflow](#data-workflow)
- [Running FAISS Similarity Search](#running-faiss-similarity-search)
- [Risk Scoring Method](#risk-scoring-method)
- [Troubleshooting](#troubleshooting)
- [Data Sources](#data-sources)

## Project Overview

The application renders U.S. county boundaries and overlays climate risk values derived from county-level hazard scores. Users can:

- Search by county, city, or ZIP code.
- Switch between risk layers (overall, heat, flood, wildfire).
- Select counties to view detailed risk bars, key metrics, recommendations, and nearest similar counties.
- Open an `Insights` page for distribution charts, state rankings, sortable tables, and county comparisons.

The frontend loads county data from `frontend/public/combined_final.csv` and computes normalized risk scores client-side.

## Core Features

- Interactive county map with hover/select details.
- Layered risk visualization (`overall`, `heat`, `flood`, `wildfire`).
- County and place search (local county matching + Mapbox geocoding proxy).
- Insights dashboard with:
  - KPI summary cards
  - Risk histograms
  - State-level ranking charts
  - Top/bottom county lists
  - Sortable and paginated county table
  - Side-by-side county comparison
- Optional FAISS utility scripts for nearest-neighbor similarity queries.

## Tech Stack

### Frontend

- React 18
- Vite 6
- React Router
- Mapbox GL via `react-map-gl`
- Recharts
- Tailwind CSS 4
- Papa Parse
- TopoJSON client

### Python Utilities

- Python 3
- pandas
- numpy
- scikit-learn
- faiss

## Repository Structure

```text
yhack_2026/
├─ backend/
│  └─ api.py
├─ frontend/
│  ├─ public/
│  │  └─ combined_final.csv
│  ├─ src/
│  │  ├─ components/
│  │  ├─ hooks/
│  │  ├─ pages/
│  │  └─ utils/
│  ├─ package.json
│  └─ vite.config.js
├─ data/
│  ├─ final_df.csv
│  ├─ risk.csv
│  ├─ combined_final.csv
│  └─ FAISS/
│     └─ faiss_metadata.csv
├─ scripts/
│  ├─ merge_risk_data.py
│  ├─ build_faiss_index.py
│  └─ query_faiss_neighbors.py
```

## Prerequisites

- Node.js 18+ and npm
- Python 3.10+ (recommended)
- A Mapbox access token

## Environment Variables

Create a `.env` file in the repository root:

```bash
MAPBOX_ACCESS_TOKEN=your_mapbox_token_here
NEWSAPI_API_KEY=your_eventregistry_api_key_here
GEMINI_API_KEY=your_gemini_api_key_here
```

Notes:

- `vite.config.js` reads `MAPBOX_ACCESS_TOKEN` from the repo root (or `frontend/`) and injects it for map rendering.
- Geocoding requests are proxied through `/api/mapbox/*` so geocode URLs in the client do not need to hardcode the token.
- County recommendation requests are proxied through `/api/recommendations` to the FastAPI backend.
- If you change `.env`, restart the Vite dev server.

## Quick Start

1) Install frontend dependencies:

```bash
cd frontend
npm install
```

2) Start development server:

```bash
npm run dev
```

3) Install backend dependencies:

```bash
cd ..
python3 -m pip install fastapi uvicorn requests eventregistry
```

4) Start the FastAPI backend (in a second terminal from repo root):

```bash
uvicorn backend.api:app --reload --host 127.0.0.1 --port 8000
```

5) Open the local URL printed by Vite (typically `http://localhost:5173`).

County flow behavior:

- Click a county -> side panel `Recommended Actions` shows a loading indicator.
- The recommendation panel shows hazard filter buttons: `All`, `Heat`, `Flood`, `Wildfire`.
- Default selected filter is the county's highest risk hazard.
- A single API call per county fetches all four hazard sections and caches them client-side.
- Changing filter does not make additional API calls; it only swaps cached bullet points locally.
- When API returns, Gemini recommendations are displayed as bullet points for readability.
- If generation fails/times out, the panel shows an empty-state message.

6) Optional production build:

```bash
npm run build
npm run preview
```

## Data Workflow

The frontend consumes `frontend/public/combined_final.csv`. If you regenerate data in `data/`, copy the latest merged CSV into `frontend/public/`.

### 1) Merge county base data with hazard index data

```bash
python3 scripts/merge_risk_data.py \
  --risk-csv data/risk.csv \
  --final-csv data/final_df.csv \
  --out-csv data/combined_final.csv
```

What this script does:

- Normalizes FIPS codes to 5 digits.
- Selects hazard score/rating columns from `risk.csv`.
- Left-joins those columns into the base county dataset.
- Writes the merged output to `data/combined_final.csv`.

### 2) Update frontend CSV

```bash
cp data/combined_final.csv frontend/public/combined_final.csv
```

## Running FAISS Similarity Search

These scripts are optional utilities for nearest-neighbor analysis on county feature vectors.

### 1) Build an index

`scripts/query_faiss_neighbors.py` defaults to files in `data/FAISS/`, so write outputs there for compatibility:

```bash
python3 scripts/build_faiss_index.py \
  --data-csv data/combined_final.csv \
  --out-index data/FAISS/faiss.index \
  --out-metadata data/FAISS/faiss_metadata.csv \
  --out-scaler data/FAISS/faiss_scaler.npy
```

### 2) Query nearest counties by FIPS

```bash
python3 scripts/query_faiss_neighbors.py --fips 06037 --k 5
```

Optional flag:

- `--include-self` includes the query county in results.

## Risk Scoring Method

Risk scores are computed in the frontend using hazard index columns from `combined_final.csv`:

- Heat risk: `Heat Wave - Hazard Type Risk Index Score`
- Flood risk: weighted blend of:
  - `Inland Flooding - Hazard Type Risk Index Score` (60%)
  - `Coastal Flooding - Hazard Type Risk Index Score` (20%)
  - `Hurricane - Hazard Type Risk Index Score` (20%)
- Wildfire risk: weighted blend of:
  - `Wildfire - Hazard Type Risk Index Score` (80%)
  - `Drought - Hazard Type Risk Index Score` (20%)

Each hazard score is converted from a 0-100 scale to a 0-1 value. Overall risk is the average of heat, flood, and wildfire risk.

## Troubleshooting

### "Mapbox token missing" message

- Ensure `.env` exists at the repository root.
- Ensure `MAPBOX_ACCESS_TOKEN` is set and valid.
- Restart `npm run dev` after editing env values.

### Search does not return city/ZIP results

- Place/city/ZIP geocoding depends on the Mapbox proxy route.
- Confirm the app is running through Vite (`npm run dev` or `npm run preview`) so `/api/mapbox` proxy is active.

### County recommendations stay empty

- Ensure FastAPI is running at `http://127.0.0.1:8000`.
- Ensure `NEWSAPI_API_KEY` and `GEMINI_API_KEY` are present in repo-root `.env`.
- Verify frontend is started through Vite so `/api/recommendations` proxy is active.

### Map data appears empty

- Confirm `frontend/public/combined_final.csv` exists and has expected columns (including `fips_code`, `lat`, `lon`, and hazard score columns).
- If you regenerated `data/combined_final.csv`, copy it into `frontend/public/combined_final.csv`.

### FAISS query errors

- Ensure index, metadata, and scaler files exist in `data/FAISS/`.
- Rebuild with the same `FEATURE_COLS` used in query time.

## Data Sources

- County boundaries: [us-atlas](https://github.com/topojson/us-atlas) (loaded via jsDelivr).
- County hazard and climate metrics: local CSV files under `data/`.

## Disclaimer

This project is intended for educational and exploratory analysis. It does not replace official risk assessments, engineering evaluations, insurance guidance, or emergency management directives.
