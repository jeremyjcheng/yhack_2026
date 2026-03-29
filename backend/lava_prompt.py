import os
import sys
from pathlib import Path
import json
from urllib.parse import quote

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
        os.environ[key] = value


def build_news_prompt(
    raw_text: str,
    prefix: str | None = None,
    max_chars: int = 120000,
) -> str:
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
                f"Title: {title}\n"
                f"Description: {description}\n"
                f"Content: {content}\n"
                f"URL: {url}\n"
            )
        body = "\n".join(parts).strip()
    else:
        body = text

    combined = f"{prefix}\n\n{body}" if prefix else body
    if len(combined) > max_chars:
        combined = combined[:max_chars] + "\n\n[Truncated]"
    return combined


def generate_lava(prompt_text: str, model: str = "gpt-4o-mini") -> str:
    load_dotenv()

    forward_token = os.getenv("LAVA_FORWARD_TOKEN", "").strip()
    if not forward_token:
        raise RuntimeError("Missing LAVA_FORWARD_TOKEN")

    target_url = "https://api.openai.com/v1/chat/completions"
    url = f"https://api.lava.so/v1/forward?u={quote(target_url, safe='')}"

    payload = {
        "model": "gpt-4o-mini",
        "messages": [
            {"role": "user", "content": prompt_text}
        ],
    }

    resp = requests.post(
        url,
        headers={
            "Authorization": f"Bearer {forward_token}",
            "Content-Type": "application/json",
        },
        json=payload,
        timeout=60,
    )

    if not resp.ok:
        raise RuntimeError(f"HTTP {resp.status_code}: {resp.text}")

    data = resp.json()
    return data.get("choices", [{}])[0].get("message", {}).get("content", "")