import argparse
import json
import os
from pathlib import Path

from newsapi import NewsApiClient


def load_dotenv(path: str = ".env") -> None:
    env_path = Path(path)
    if not env_path.is_file():
        return
    for line in env_path.read_text().splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        os.environ.setdefault(key.strip(), value.strip())


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--prompt", required=True, help="Search prompt")
    parser.add_argument(
        "--location",
        default="Austin, TX, Texas, United States",
        help="Unused for NewsAPI (kept for compatibility)",
    )
    args = parser.parse_args()

    load_dotenv()
    api_key_test = os.getenv("NEWSAPI_API_KEY")
    if not api_key_test:
        raise SystemExit("Missing NEWSAPI_API_KEY in environment or .env")

    client = NewsApiClient(api_key=api_key_test)
    results = client.get_everything(
        q=args.prompt,
        language="en",
        sort_by="publishedAt",
        page_size=50,
    )
    print(json.dumps(results, indent=2))


if __name__ == "__main__":
    main()