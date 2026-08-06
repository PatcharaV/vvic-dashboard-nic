import argparse
import asyncio
import json
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
BACKEND_DIR = ROOT / "backend"
FRONTEND_SNAPSHOT_PATH = ROOT / "frontend" / "src" / "snapshotData.json"

if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from app.analytics import build_dashboard, build_options  # noqa: E402
from app.catalog import MONTH_CODES, scrape_products  # noqa: E402
from app.main import current_scrape_period, make_scrape_period  # noqa: E402


def merge_ordered(values: list[str], extra_values: list[str]) -> list[str]:
    merged: list[str] = []
    seen: set[str] = set()
    for value in [*extra_values, *values]:
        if value in seen:
            continue
        seen.add(value)
        merged.append(value)
    return merged


def write_json(path: Path, payload: dict) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(
        json.dumps(payload, ensure_ascii=False, separators=(",", ":")),
        encoding="utf-8",
    )


def build_frontend_snapshot(payload: dict) -> dict:
    products = payload.get("products", [])
    brand_options = build_options(products).get("brands", [])
    collection_options_by_brand = {
        source.get("brand"): source.get("collection_options", [])
        for source in payload.get("sources", [])
        if source.get("brand")
    }
    snapshot = {
        "period": payload.get("scrape_period", {}),
        "scraped_at": payload.get("scraped_at"),
        "brandOptions": brand_options,
        "brands": {},
    }
    for brand in [option["value"] for option in brand_options]:
        brand_products = [
            product for product in products if product.get("brand") == brand
        ]
        options = build_options(brand_products)
        options["collections"] = merge_ordered(
            options.get("collections", []),
            collection_options_by_brand.get(brand, []),
        )
        snapshot["brands"][brand] = {
            "options": options,
            "dashboard": build_dashboard(
                brand_products,
                payload.get("source"),
                payload.get("scraped_at"),
                payload.get("scrape_period"),
                [],
            ),
        }
    return snapshot


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Scrape a monthly catalog snapshot and persist dashboard data."
    )
    parser.add_argument(
        "--month",
        choices=MONTH_CODES,
        help="Month code to scrape. Defaults to the current Bangkok month.",
    )
    parser.add_argument(
        "--year",
        type=int,
        help="Year to scrape. Defaults to the current Bangkok year.",
    )
    return parser.parse_args()


async def main() -> None:
    args = parse_args()
    if args.month or args.year:
        if not args.month or not args.year:
            raise SystemExit("--month and --year must be provided together")
        period = make_scrape_period(args.month, args.year)
    else:
        period = current_scrape_period()

    payload = await scrape_products(scrape_period=period)
    snapshot = build_frontend_snapshot(payload)
    write_json(FRONTEND_SNAPSHOT_PATH, snapshot)
    print(
        json.dumps(
            {
                "status": "completed",
                "period": payload.get("scrape_period"),
                "product_count": payload.get("product_count"),
                "scraped_at": payload.get("scraped_at"),
                "warnings": payload.get("scrape_warnings", []),
            },
            ensure_ascii=False,
            indent=2,
        )
    )


if __name__ == "__main__":
    asyncio.run(main())
