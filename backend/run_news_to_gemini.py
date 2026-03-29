import argparse
import json
import re
import sys

from output_news import fetch_news
from gemini_prompt import build_news_prompt, generate_gemini

HAZARD_CHOICES = ("all", "heat", "flood", "wildfire")


def build_county_defaults(county: str, state: str | None, hazard: str) -> tuple[str, str]:
    location = f"{county} County, {state}" if state else f"{county} County"
    if hazard == "heat":
        query = f"{county} County heat wave mitigation cooling plans extreme heat preparedness"
    elif hazard == "flood":
        query = f"{county} County flood mitigation drainage stormwater preparedness resilience"
    elif hazard == "wildfire":
        query = f"{county} County wildfire mitigation defensible space evacuation planning"
    else:
        query = (
            f"{county} County climate risk mitigation adaptation resilience "
            f"wildfire flood heat planning"
        )
    return location, query


def default_prompt_template(hazard: str) -> str:
    if hazard == "heat":
        return (
            "Given the content in {content}, provide concise, practical recommendations to reduce "
            "heat-related risk in this county. Return 3-4 bullet points only, with each line "
            "starting with '- '."
        )
    if hazard == "flood":
        return (
            "Given the content in {content}, provide concise, practical recommendations to reduce "
            "flood-related risk in this county. Return 3-4 bullet points only, with each line "
            "starting with '- '."
        )
    if hazard == "wildfire":
        return (
            "Given the content in {content}, provide concise, practical recommendations to reduce "
            "wildfire risk in this county. Return 3-4 bullet points only, with each line starting "
            "with '- '."
        )
    return (
        "Given the content in {content}, provide concise, practical recommendations to reduce "
        "climate risk in this county across heat, flood, and wildfire. Return 3-4 bullet points "
        "only, with each line starting with '- '."
    )


def extract_bullets(text: str, limit: int = 4) -> list[str]:
    bullets: list[str] = []
    for raw_line in text.splitlines():
        line = raw_line.strip()
        if not line:
            continue
        if line.startswith("#"):
            continue
        if line.startswith(("- ", "* ", "• ")):
            candidate = line[2:].strip()
        else:
            numbered = re.sub(r"^\d+[.)\s-]+", "", line).strip()
            candidate = numbered if numbered != line else ""
        if not candidate:
            continue
        bullets.append(candidate)
        if len(bullets) >= limit:
            break

    if bullets:
        return bullets

    fallback = [s.strip() for s in re.split(r"(?<=[.!?])\s+", text.strip()) if s.strip()]
    return fallback[:limit]


def build_prompt_text(content: str, location_context: str, hazard: str, template: str) -> str:
    return (
        f"Target county: {location_context}\n"
        f"Hazard focus: {hazard}\n\n"
        + template.format(content=content)
    )


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--news-query", help="NewsAPI query string")
    parser.add_argument("--county", help="County name (without 'County' suffix)")
    parser.add_argument("--state", help="State name")
    parser.add_argument("--fips", help="Optional county FIPS code for context")
    parser.add_argument(
        "--hazard",
        default="all",
        choices=HAZARD_CHOICES,
        help="Hazard focus for generated recommendations.",
    )
    parser.add_argument("--prompt-template", help="Prompt template. Use {content} placeholder.")
    parser.add_argument("--model", default="gemini-3-flash-preview")
    parser.add_argument("--location", help="Location used for local news filtering")
    parser.add_argument("--sort-by", default="date")
    parser.add_argument("--max-items", type=int, default=20)
    parser.add_argument("--print-news-json", action="store_true")
    parser.add_argument("--debug", action="store_true", help="Print debug logs to stderr")
    parser.add_argument(
        "--all-hazards-json",
        action="store_true",
        help="Generate recommendations for all hazard filters and print JSON.",
    )
    args = parser.parse_args()

    if not args.news_query and not args.county:
        parser.error("Provide either --news-query or --county.")

    default_location = "Austin, Texas"
    news_query = args.news_query
    location = args.location
    if args.county:
        county_location, county_query = build_county_defaults(args.county, args.state, args.hazard)
        news_query = news_query or county_query
        location = location or county_location
    else:
        location = location or default_location

    if args.debug:
        print("[run_news_to_gemini] resolved county:", args.county, file=sys.stderr)
        print("[run_news_to_gemini] resolved state:", args.state, file=sys.stderr)
        print("[run_news_to_gemini] resolved fips:", args.fips, file=sys.stderr)
        print("[run_news_to_gemini] hazard:", args.hazard, file=sys.stderr)
        print(f"query: {news_query}", file=sys.stderr)
        print(f"location: {location}", file=sys.stderr)
        print("[run_news_to_gemini] news_query:", news_query, file=sys.stderr)
        print("[run_news_to_gemini] location:", location, file=sys.stderr)
        print("[run_news_to_gemini] model:", args.model, file=sys.stderr)

    news = fetch_news(
        prompt=news_query,
        location=location,
        sort_by=args.sort_by,
        max_items=args.max_items,
    )
    if args.debug:
        print(
            f"[run_news_to_gemini] fetched articles: {news.get('totalResults', 0)}",
            file=sys.stderr,
        )

    if args.print_news_json:
        print(json.dumps(news, indent=2))

    news_json = json.dumps(news)
    content = build_news_prompt(news_json, prefix=None)
    location_context = location
    if args.fips:
        location_context = f"{location_context} (FIPS {args.fips})"

    if args.all_hazards_json:
        recommendations: dict[str, list[str]] = {}
        for hazard in HAZARD_CHOICES:
            template = default_prompt_template(hazard)
            prompt_text = build_prompt_text(content, location_context, hazard, template)
            response = generate_gemini(prompt_text, model=args.model)
            recommendations[hazard] = extract_bullets(response)
            if args.debug:
                print(
                    f"[run_news_to_gemini] hazard={hazard} bullet_count={len(recommendations[hazard])}",
                    file=sys.stderr,
                )
                print(f"output ({hazard}): {json.dumps(recommendations[hazard])}", file=sys.stderr)
        print(json.dumps({"recommendations": recommendations}))
        return

    template = args.prompt_template or default_prompt_template(args.hazard)
    prompt_text = build_prompt_text(content, location_context, args.hazard, template)
    response = generate_gemini(prompt_text, model=args.model)
    bullets = extract_bullets(response)
    if args.debug:
        print(
            f"[run_news_to_gemini] summary chars: {len(response.strip())}",
            file=sys.stderr,
        )
        print(f"output: {json.dumps(bullets)}", file=sys.stderr)
    print("\n".join(f"- {item}" for item in bullets))


if __name__ == "__main__":
    main()
