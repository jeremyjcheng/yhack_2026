import os
import sys
from pathlib import Path
import json

import requests


def load_dotenv(path: str = ".env") -> None:
    env_path = Path(path)
    if not env_path.is_file():
        return

    for line in env_path.read_text().splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        key = key.strip()
        value = value.strip().strip('"').strip("'")
        # Ensure repo .env values are used even if shell has stale exports.
        os.environ[key] = value


def build_news_prompt(raw_text: str, prefix: str | None = None, max_chars: int = 120000) -> str:
    text = raw_text.strip()
    try:
        data = json.loads(text)
    except json.JSONDecodeError:
        data = None

    if isinstance(data, dict) and "articles" in data:
        articles = data.get("articles", [])
        parts = []
        for article in articles:
            title = article.get("title", "")
            description = article.get("description", "")
            content = article.get("content", "")
            url = article.get("url", "")
            parts.append(
                f"Title: {title}\nDescription: {description}\nContent: {content}\nURL: {url}\n"
            )
        body = "\n".join(parts).strip()
    else:
        body = text

    if prefix:
        combined = f"{prefix}\n\n{body}"
    else:
        combined = body

    if len(combined) > max_chars:
        combined = combined[:max_chars] + "\n\n[Truncated]"
    return combined


def generate_gemini(prompt_text: str, model: str = "gemini-3-flash-preview") -> str:
    load_dotenv()
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        print("Missing GEMINI_API_KEY environment variable.", file=sys.stderr)
        sys.exit(1)

    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"
    payload = {
        "contents": [
            {
                "role": "user",
                "parts": [{"text": prompt_text}],
            }
        ]
    }

    resp = requests.post(url, params={"key": api_key}, json=payload, timeout=60)
    if not resp.ok:
        print(f"HTTP {resp.status_code} error:", file=sys.stderr)
        print(resp.text, file=sys.stderr)
        sys.exit(1)
    data = resp.json()

    candidates = data.get("candidates", [])
    if not candidates:
        return ""

    text_parts = candidates[0].get("content", {}).get("parts", [])
    return "".join(part.get("text", "") for part in text_parts)
