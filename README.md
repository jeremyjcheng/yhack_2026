# Climate Risk Advisor

Climate Risk Advisor is an interactive web application for exploring county-level climate risk across the United States. It combines FEMA National Risk Index data, weather metrics, hazard scores, and AI-powered analysis to help users understand heat, flood, and wildfire risk at the county level.

The repository includes:

- A React + Vite frontend with an interactive county map, analytics dashboards, and an About page.
- A Python FastAPI backend powering AI county recommendations and a RAG-based climate risk chatbot.
- Data-processing and FAISS indexing scripts for similarity search and document retrieval.
- A FEMA PDF RAG pipeline that combines documentation methodology with actual county-level data to answer questions.

## How to run this application

You need **two terminals**: one for the Vite frontend and one for the FastAPI backend. The map and Insights page load without the backend, but recommendations and chat require it.

1. **Prerequisites:** Node.js 18+, npm, Python 3.10+, a [Mapbox](https://www.mapbox.com/) access token.

2. **Environment:** Create a `.env` file in the repository root (see [Environment Variables](#environment-variables)).

3. **Frontend (terminal 1):**

   ```bash
   cd frontend
   npm install
   npm run dev
   ```

   Vite prints a local URL (usually `http://localhost:5173`). Open it in your browser. The dev server proxies `/api/mapbox`, `/api/recommendations`, and `/api/chat` to the backend.

4. **Backend (terminal 2), from the repository root:**

   ```bash
   python3 -m venv .venv
   source .venv/bin/activate
   pip install -r requirements.txt
   uvicorn backend.api:app --reload --host 127.0.0.1 --port 8000
   ```

5. **Build FEMA RAG index (one-time setup for chat):**

   ```bash
   python3 scripts/build_fema_pdf_index.py \
     --pdf-path data/fema_national-risk-index_technical-documentation.pdf \
     --out-index data/FAISS/fema_pdf.index \
     --out-chunks data/FAISS/fema_pdf_chunks.jsonl \
     --out-meta data/FAISS/fema_pdf_meta.json
   ```

6. Open the Vite URL in your browser.

## Table of Contents

- [Core Features](#core-features)
- [Tech Stack](#tech-stack)
- [Repository Structure](#repository-structure)
- [Prerequisites](#prerequisites)
- [Environment Variables](#environment-variables)
- [Running the application (step-by-step)](#running-the-application-step-by-step)
- [Climate Risk Chatbot](#climate-risk-chatbot)
- [Data Workflow](#data-workflow)
- [Running FAISS Similarity Search](#running-faiss-similarity-search)
- [Risk Scoring Method](#risk-scoring-method)
- [Troubleshooting](#troubleshooting)
- [Data Sources](#data-sources)

## Core Features

- **Interactive county map** with hover tooltips, click-to-select details, and fly-to navigation.
- **Risk layer switching** between overall, heat, flood, and wildfire views with a color legend.
- **County and place search** with local fuzzy matching and Mapbox geocoding fallback.
- **Side panel** showing key climate stats, animated risk bars, AI recommendations, and similar counties.
- **AI county recommendations** powered by Gemini via Event Registry news context, with per-hazard tabs (All, Heat, Flood, Wildfire).
- **Climate Risk Advisor chatbot** -- a floating widget grounded on the FEMA NRI technical documentation and actual county data. It answers questions with concise, data-backed bullet points.
- **Insights dashboard** with KPI cards, risk histograms, state-level rankings, top/bottom county lists, sortable/paginated tables, and side-by-side county comparison.
- **About page** with project description, authors, and tech stack summary.
- **FAISS similarity search** scripts for nearest-neighbor county analysis.

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

### Backend

- Python 3.10+
- FastAPI + Uvicorn
- Google Gemini API (generation and embeddings)
- FAISS (vector similarity search and PDF RAG retrieval)
- pandas, numpy, scikit-learn
- pypdf (PDF text extraction)
- requests
- Event Registry (news API for recommendations)

## Repository Structure

```text
yhack_2026/
├── .env                          # API keys (not committed)
├── .gitignore
├── README.md
├── requirements.txt              # Python dependencies
├── run_news_to_lava.py           # News + Lava recommendation pipeline
├── lava_prompt.py                # Lava prompt templates for recommendations
├── output_news.py                # Event Registry news fetching
├── data_collection.ipynb         # Data collection and exploration notebook
│
├── backend/
│   ├── api.py                    # FastAPI app: /api/recommendations, /api/chat
│   └── fema_pdf_rag.py           # FEMA PDF + county data RAG pipeline
│
├── frontend/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js            # Dev server config with API proxies
│   ├── public/
│   │   ├── combined_final.csv    # County data consumed by the frontend
│   │   └── county-data.json
│   └── src/
│       ├── main.jsx              # App entry point
│       ├── App.jsx               # React Router setup (/, /insights, /about)
│       ├── index.css             # Global styles
│       ├── components/
│       │   ├── GlobalChatWidget.jsx    # Floating climate risk chatbot
│       │   ├── HoverTooltip.jsx       # Map hover county tooltip
│       │   ├── Layout.jsx             # Shell: Navbar + Outlet + ChatWidget
│       │   ├── LoadingOverlay.jsx     # Full-screen loading spinner
│       │   ├── MapLegend.jsx          # Risk layer toggle legend
│       │   ├── MapView.jsx            # Mapbox GL county map
│       │   ├── Navbar.jsx             # Top navigation bar
│       │   ├── Recommendations.jsx    # AI hazard recommendations panel
│       │   ├── RiskBars.jsx           # Animated risk score bars
│       │   ├── SearchBar.jsx          # County/place search input
│       │   ├── SidePanel.jsx          # County detail slide-out panel
│       │   ├── SimilarCounties.jsx    # Similar counties list
│       │   └── StatsGrid.jsx          # Key climate stats grid
│       ├── hooks/
│       │   └── useCountyData.js       # Loads TopoJSON + CSV, builds GeoJSON
│       ├── pages/
│       │   ├── MapPage.jsx            # Main map page
│       │   ├── InsightsPage.jsx       # Analytics dashboard
│       │   └── AboutPage.jsx          # About page
│       └── utils/
│           ├── chatApi.js             # POST /api/chat client
│           ├── insightsStats.js       # Stats helpers for Insights
│           ├── recommendations.js     # Static recommendation fallbacks
│           ├── riskScoring.js         # Risk normalization and Mapbox expressions
│           └── search.js             # Local + geocode search logic
│
├── data/
│   ├── final_df.csv              # Base county data with hazard risk scores
│   ├── risk.csv                  # Full FEMA NRI dataset (demographics, exposure, EAL)
│   ├── combined_final.csv        # Merged output of final_df + risk columns
│   ├── us_county_clean.csv       # Cleaned county reference data
│   ├── us_county_latlng.csv      # County centroid coordinates
│   ├── fema_national-risk-index_technical-documentation.pdf
│   └── FAISS/
│       ├── faiss.index           # County-feature similarity index
│       ├── faiss_metadata.csv    # County metadata for similarity queries
│       ├── faiss_scaler.npy      # Feature scaler for similarity index
│       ├── fema_pdf.index        # FEMA PDF chunk embeddings index
│       ├── fema_pdf_chunks.jsonl # FEMA PDF chunk text and metadata
│       └── fema_pdf_meta.json    # FEMA PDF index build metadata
│
└── scripts/
    ├── build_faiss_index.py      # Build county-feature FAISS index
    ├── build_fema_pdf_index.py   # Chunk/embed FEMA PDF into FAISS index
    ├── merge_risk_data.py        # Merge risk.csv into final_df.csv
    └── query_faiss_neighbors.py  # Query nearest counties by FIPS
```

## Prerequisites

- Node.js 18+ and npm
- Python 3.10+ (on macOS with Homebrew Python, create a venv first: `python3 -m venv .venv && source .venv/bin/activate`)
- A Mapbox access token

## Environment Variables

Create a `.env` file in the repository root:

```bash
MAPBOX_ACCESS_TOKEN=your_mapbox_token_here
NEWSAPI_API_KEY=your_eventregistry_api_key_here
GEMINI_API_KEY=your_gemini_api_key_here
LAVA_FORWARD_TOKEN=your_lava_forward_token_here
```

| Variable | Required for | Description |
|----------|-------------|-------------|
| `MAPBOX_ACCESS_TOKEN` | Map, geocoding | Renders the county map and powers place/ZIP search |
| `NEWSAPI_API_KEY` | Recommendations | Event Registry key for news-grounded county recommendations |
| `GEMINI_API_KEY` | Chat | Google Gemini API key for AI generation and embeddings |
| `LAVA_FORWARD_TOKEN` | Recommendations | Lava forward token for routing AI requests (GPT via proxy) |

Notes:
- `vite.config.js` reads `MAPBOX_ACCESS_TOKEN` from the repo root `.env` and injects it as `import.meta.env.VITE_MAPBOX_TOKEN`.
- API routes are proxied through Vite: `/api/mapbox` to Mapbox, `/api/recommendations` and `/api/chat` to `http://127.0.0.1:8000`.
- Restart `npm run dev` after editing `.env`.

## Running the application (step-by-step)

### 1. Install frontend dependencies

```bash
cd frontend
npm install
```

### 2. Start the Vite dev server

```bash
npm run dev
```

### 3. Set up the Python environment (from the repository root)

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

### 4. Build the FEMA PDF RAG index (one-time)

```bash
python3 scripts/build_fema_pdf_index.py \
  --pdf-path data/fema_national-risk-index_technical-documentation.pdf \
  --out-index data/FAISS/fema_pdf.index \
  --out-chunks data/FAISS/fema_pdf_chunks.jsonl \
  --out-meta data/FAISS/fema_pdf_meta.json
```

This only needs to run once. Re-run if the source PDF changes.

### 5. Start the FastAPI backend (second terminal)

```bash
source .venv/bin/activate
uvicorn backend.api:app --reload --host 127.0.0.1 --port 8000
```

### 6. Open the app

Navigate to the URL printed by Vite (typically `http://localhost:5173`).

### County interaction flow

- Click a county to open the side panel with stats, risk bars, and recommendations.
- Recommendation panel has hazard tabs: All, Heat, Flood, Wildfire.
- Default tab is the county's highest risk hazard.
- One API call per county fetches all four hazard sections; switching tabs swaps cached results locally.
- The floating "Risk Advisor" chat button opens the Climate Risk Advisor chatbot.

### Production build (optional)

```bash
cd frontend
npm run build
npm run preview
```

## Climate Risk Chatbot

The chatbot is a floating widget available on every page. It uses a dual-source RAG (Retrieval Augmented Generation) pipeline:

1. **FEMA NRI technical documentation** -- the PDF is chunked, embedded with Gemini embeddings, and stored in a FAISS index. At query time, the top relevant chunks are retrieved by semantic similarity.

2. **County-level data** -- when a county is mentioned in the question (or passed via the UI), the system loads actual hazard scores from `data/final_df.csv` and detailed demographics/exposure data from `data/risk.csv` (population, building value, agriculture value, expected annual loss, annualized frequency, historic loss ratios, etc.).

Both sources are combined in the Gemini prompt so the model can reference real numbers and infer explanations using the FEMA methodology. For example, if asked why Catron County, NM has low heat risk, the chatbot will cite the county's small population (3,556), zero historic loss ratios, low annualized frequency (0.39), and resulting low Expected Annual Loss ($7,468).

Responses are formatted as 4-5 concise bullet points.

### Testing the chat API directly

```bash
curl -X POST http://127.0.0.1:8000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"question":"How does FEMA calculate Expected Annual Loss?","history":[]}'
```

With a specific county:

```bash
curl -X POST http://127.0.0.1:8000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"question":"Why does this county have low heat risk?","county":"Catron","state":"New Mexico","fips":"35003","history":[]}'
```

## Data Workflow

The frontend consumes `frontend/public/combined_final.csv`. If you regenerate data in `data/`, copy the merged CSV into `frontend/public/`.

### 1. Merge county base data with hazard index data

```bash
python3 scripts/merge_risk_data.py \
  --risk-csv data/risk.csv \
  --final-csv data/final_df.csv \
  --out-csv data/combined_final.csv
```

This normalizes FIPS codes, selects hazard score/rating columns from `risk.csv`, left-joins them into the base county dataset, and writes `data/combined_final.csv`.

### 2. Update frontend CSV

```bash
cp data/combined_final.csv frontend/public/combined_final.csv
```

### Source data files

| File | Description |
|------|-------------|
| `data/final_df.csv` | Base county data: FIPS, name, state, lat/lon, weather metrics, all hazard risk index scores and ratings |
| `data/risk.csv` | Full FEMA NRI export: population, building value, agriculture value, area, expected annual loss, exposure, annualized frequency, historic loss ratios per hazard |
| `data/combined_final.csv` | Merged output used by the frontend |
| `data/us_county_clean.csv` | Cleaned county reference data |
| `data/us_county_latlng.csv` | County centroid coordinates |
| `data/fema_national-risk-index_technical-documentation.pdf` | FEMA NRI methodology documentation (source for RAG) |

## Running FAISS Similarity Search

These scripts are optional utilities for nearest-neighbor analysis on county feature vectors.

### 1. Build an index

```bash
python3 scripts/build_faiss_index.py \
  --data-csv data/combined_final.csv \
  --out-index data/FAISS/faiss.index \
  --out-metadata data/FAISS/faiss_metadata.csv \
  --out-scaler data/FAISS/faiss_scaler.npy
```

### 2. Query nearest counties by FIPS

```bash
python3 scripts/query_faiss_neighbors.py --fips 06037 --k 5
```

Optional flag: `--include-self` includes the query county in results.

## Risk Scoring Method

Risk scores are computed in the frontend (and mirrored in the backend for the chatbot) using hazard index columns from `combined_final.csv`:

- **Heat risk:** `Heat Wave - Hazard Type Risk Index Score`
- **Flood risk:** weighted blend of:
  - `Inland Flooding - Hazard Type Risk Index Score` (60%)
  - `Coastal Flooding - Hazard Type Risk Index Score` (20%)
  - `Hurricane - Hazard Type Risk Index Score` (20%)
- **Wildfire risk:** weighted blend of:
  - `Wildfire - Hazard Type Risk Index Score` (80%)
  - `Drought - Hazard Type Risk Index Score` (20%)

Each hazard score is converted from a 0--100 scale to a 0--1 value. Overall risk is the average of heat, flood, and wildfire risk.

## Troubleshooting

### Mapbox token missing

- Ensure `.env` exists at the repository root with `MAPBOX_ACCESS_TOKEN` set.
- Restart `npm run dev` after editing `.env`.

### Search does not return city/ZIP results

- Place/city/ZIP geocoding depends on the Mapbox proxy route.
- Confirm the app is running through Vite (`npm run dev` or `npm run preview`) so `/api/mapbox` proxy is active.

### County recommendations stay empty

- Ensure FastAPI is running at `http://127.0.0.1:8000`.
- Ensure `NEWSAPI_API_KEY` and `LAVA_FORWARD_TOKEN` are present in `.env`.
- Verify frontend is started through Vite so `/api/recommendations` proxy is active.

### Chat returns "missing FEMA artifact" error

- Build the FEMA RAG files: `python3 scripts/build_fema_pdf_index.py` (see [step 4](#4-build-the-fema-pdf-rag-index-one-time)).
- Confirm these files exist: `data/FAISS/fema_pdf.index`, `data/FAISS/fema_pdf_chunks.jsonl`, `data/FAISS/fema_pdf_meta.json`.
- Ensure `GEMINI_API_KEY` is set.

### Chat responses lack county-specific data

- The chatbot resolves counties from the question text, or from `county`/`state`/`fips` fields in the request.
- Ensure `data/final_df.csv` and `data/risk.csv` exist in the repository root.
- Mention the county name and state explicitly in your question (e.g. "Catron County New Mexico").

### Map data appears empty

- Confirm `frontend/public/combined_final.csv` exists with expected columns (`fips_code`, `lat`, `lon`, hazard score columns).
- If you regenerated data, copy it: `cp data/combined_final.csv frontend/public/combined_final.csv`.

### FAISS query errors

- Ensure index, metadata, and scaler files exist in `data/FAISS/`.
- Rebuild with `scripts/build_faiss_index.py` if column definitions changed.

## Data Sources

- **County boundaries:** [us-atlas](https://github.com/topojson/us-atlas) (loaded via jsDelivr CDN).
- **Hazard and risk metrics:** [FEMA National Risk Index](https://hazards.fema.gov/nri/).
- **Weather data:** Local CSV files under `data/`.
- **FEMA methodology:** FEMA National Risk Index Technical Documentation PDF.

## Disclaimer

This project is intended for educational and exploratory analysis. It does not replace official risk assessments, engineering evaluations, insurance guidance, or emergency management directives.
