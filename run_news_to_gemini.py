import argparse
import json

from output_news import fetch_news
from gemini_prompt import build_news_prompt, generate_gemini


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--news-query", required=True, help="NewsAPI query string")
    parser.add_argument(
        "--prompt-template",
        default=(
            "Given the content here in {content}, give me a summary in terms of the ways "
            "the articles state that this area reduce risk of fire."
        ),
        help="Prompt template. Use {content} placeholder.",
    )
    parser.add_argument("--model", default="gemini-3-flash-preview")
    parser.add_argument("--location", default="Austin, Texas")
    parser.add_argument("--sort-by", default="date")
    parser.add_argument("--max-items", type=int, default=20)
    parser.add_argument("--print-news-json", action="store_true")
    args = parser.parse_args()

    news = fetch_news(
        prompt=args.news_query,
        location=args.location,
        sort_by=args.sort_by,
        max_items=args.max_items,
    )

    if args.print_news_json:
        print(json.dumps(news, indent=2))

    news_json = json.dumps(news)
    content = build_news_prompt(news_json, prefix=None)
    prompt_text = args.prompt_template.format(content=content)
    response = generate_gemini(prompt_text, model=args.model)
    print(response)


if __name__ == "__main__":
    main()
