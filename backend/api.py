from __future__ import annotations

import json
import subprocess
import sys
from pathlib import Path

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

from backend.fema_pdf_rag import answer_from_fema_pdf


class RecommendationRequest(BaseModel):
    county: str
    state: str | None = None
    fips: str | None = None


class ChatHistoryMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    question: str
    county: str | None = None
    state: str | None = None
    fips: str | None = None
    history: list[ChatHistoryMessage] = []


app = FastAPI(title="Climate Risk Advisor API")
REPO_ROOT = Path(__file__).resolve().parent.parent
SCRIPT_PATH = REPO_ROOT / "backend" / "run_news_to_lava.py"


@app.post("/api/recommendations")
def recommendations(payload: RecommendationRequest) -> dict[str, dict[str, list[str]]]:
    if not payload.county.strip():
        raise HTTPException(status_code=400, detail="county is required")

    payload_debug = {
        "county": payload.county.strip(),
        "state": payload.state.strip() if payload.state else None,
        "fips": payload.fips.strip() if payload.fips else None,
    }
    print(
        f"[recommendations] incoming payload: {json.dumps(payload_debug)}",
        file=sys.stderr,
    )

    cmd = [
        sys.executable,
        str(SCRIPT_PATH),
        "--county",
        payload.county.strip(),
        "--all-hazards-json",
        "--debug",
    ]
    if payload.state and payload.state.strip():
        cmd.extend(["--state", payload.state.strip()])
    if payload.fips and payload.fips.strip():
        cmd.extend(["--fips", payload.fips.strip()])

    print(f"[recommendations] command: {' '.join(cmd)}", file=sys.stderr)

    try:
        result = subprocess.run(
            cmd,
            cwd=REPO_ROOT,
            check=False,
            capture_output=True,
            text=True,
            timeout=90,
        )
    except subprocess.TimeoutExpired as exc:
        raise HTTPException(status_code=504, detail="Recommendation request timed out") from exc
    except Exception as exc:  # pragma: no cover - defensive guard
        raise HTTPException(status_code=500, detail="Failed to execute recommendation pipeline") from exc

    raw_stdout = result.stdout.strip()
    print(f"[recommendations] return code: {result.returncode}", file=sys.stderr)
    if result.stderr.strip():
        print(f"[recommendations] stderr:\n{result.stderr.strip()}", file=sys.stderr)
    if raw_stdout:
        preview = raw_stdout[:400]
        print(f"[recommendations] stdout preview:\n{preview}", file=sys.stderr)

    if result.returncode != 0:
        detail = result.stderr.strip() or "Failed to generate recommendations"
        raise HTTPException(status_code=502, detail=detail)
    if not raw_stdout:
        raise HTTPException(status_code=502, detail="No recommendation summary generated")

    try:
        data = json.loads(raw_stdout)
    except json.JSONDecodeError as exc:
        raise HTTPException(status_code=502, detail="Recommendation output was not valid JSON") from exc

    recommendations = data.get("recommendations")
    if not isinstance(recommendations, dict):
        raise HTTPException(status_code=502, detail="Missing recommendations in output")

    expected = ("all", "heat", "flood", "wildfire")
    normalized: dict[str, list[str]] = {}
    for key in expected:
        items = recommendations.get(key, [])
        if not isinstance(items, list):
            items = []
        normalized[key] = [str(item).strip() for item in items if str(item).strip()]

    return {"recommendations": normalized}


@app.post("/api/chat")
def chat(payload: ChatRequest) -> dict[str, object]:
    if not payload.question.strip():
        raise HTTPException(status_code=400, detail="question is required")

    try:
        response = answer_from_fema_pdf(
            repo_root=REPO_ROOT,
            question=payload.question.strip(),
            county=payload.county.strip() if payload.county else None,
            state=payload.state.strip() if payload.state else None,
            fips=payload.fips.strip() if payload.fips else None,
            history=[
                {"role": msg.role.strip(), "content": msg.content.strip()}
                for msg in payload.history
                if msg.content.strip()
            ],
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except FileNotFoundError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    except Exception as exc:  # pragma: no cover - defensive guard
        raise HTTPException(status_code=500, detail="Failed to answer chat request") from exc

    answer = str(response.get("answer", "")).strip()
    citations = response.get("citations", [])
    debug_context = response.get("debug_context", {})

    if not answer:
        raise HTTPException(status_code=502, detail="Empty chat response")
    if not isinstance(citations, list):
        citations = []
    if not isinstance(debug_context, dict):
        debug_context = {}

    return {
        "answer": answer,
        "citations": [str(item).strip() for item in citations if str(item).strip()],
        "debug_context": debug_context,
    }
