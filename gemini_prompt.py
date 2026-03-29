import argparse
import os
import sys
from pathlib import Path

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
        os.environ.setdefault(key, value)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--prompt", required=True, help="Prompt to send to Gemini")
    parser.add_argument(
        "--model",
        default="gemini-3-flash-preview",
        help="Gemini model name (e.g., gemini-1.5-flash, gemini-1.5-pro)",
    )
    args = parser.parse_args()

    load_dotenv()
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        print("Missing GEMINI_API_KEY environment variable.", file=sys.stderr)
        sys.exit(1)

    url = f"https://generativelanguage.googleapis.com/v1beta/models/{args.model}:generateContent"
    payload = {
        "contents": [
            {
                "role": "user",
                "parts": [{"text": args.prompt}],
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
        print("No response returned.")
        return

    text_parts = candidates[0].get("content", {}).get("parts", [])
    response_text = "".join(part.get("text", "") for part in text_parts)
    print(response_text)


if __name__ == "__main__":
    main()
