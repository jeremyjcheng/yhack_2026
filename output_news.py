import os
from pathlib import Path
from typing import Any

from eventregistry import EventRegistry, QueryArticlesIter, QueryItems, ReturnInfo, ArticleInfoFlags


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


def get_eventregistry_key() -> str:
    load_dotenv()
    api_key = os.getenv("NEWSAPI_API_KEY")
    if not api_key:
        raise SystemExit("Missing NEWSAPI_API_KEY in environment or .env")
    return api_key


def fetch_news(
    prompt: str,
    location: str = "Austin, Texas",
    sort_by: str = "date",
    max_items: int = 20,
) -> dict[str, Any]:
    er = EventRegistry(apiKey=get_eventregistry_key())
    location_uri = er.getLocationUri(location) if location else None

    query = QueryArticlesIter(
        keywords=QueryItems.OR([prompt]),
        sourceLocationUri=location_uri,
        lang="eng",
    )

    articles = []
    for article in query.execQuery(
        er,
        sortBy=sort_by,
        maxItems=max_items,
        returnInfo=ReturnInfo(
            articleInfo=ArticleInfoFlags(bodyLen=-1, title=True, body=True, url=True)
        ),
    ):
        articles.append(
            {
                "title": article.get("title"),
                "description": article.get("summary"),
                "content": article.get("body"),
                "url": article.get("url"),
                "source": article.get("source", {}).get("title"),
                "publishedAt": article.get("date"),
            }
        )

    return {"status": "ok", "totalResults": len(articles), "articles": articles}