import asyncio
import gc
import re
from datetime import datetime, timezone
from typing import Any

import httpx
from bs4 import BeautifulSoup

from .scraper import _plain_text, extract_product_functions

BASE_URL = "https://us.lskd.co"
PRODUCT_FEED_PATH = "/collections/all/products.json"
PAGE_SIZE = 50
MAX_PAGES = 100
MAX_RETRIES = 5

APPAREL_CATEGORIES = {
    "bras": "Sports Bras",
    "bodysuits": "Bodysuits",
    "hoodies": "Hoodies & Sweatshirts",
    "jackets": "Outerwear",
    "leggings": "Leggings",
    "pants": "Pants",
    "shorts": "Shorts",
    "skirts": "Skirts",
    "sweaters": "Sweaters",
    "tanks": "Tanks",
    "tees": "Tees",
    "underwear": "Underwear",
}

INNOVATION_PATTERNS = (
    ("Breathable", r"\bbreathab(?:le|ility)\b|\bventilat(?:ed|ion)\b"),
    ("Four Way Stretch", r"\b(?:four|4)[- ]?way stretch\b"),
    ("Sweat Wicking", r"\b(?:sweat|moisture)[- ]?wick(?:ing)?\b"),
    ("Quick Drying", r"\bquick[- ]?dry(?:ing)?\b|\bfast[- ]?dry(?:ing)?\b"),
    ("Water Repellent", r"\bwater[- ]?repellent\b|\bDWR\b"),
    ("Water Resistant", r"\bwater[- ]?resistant\b"),
    ("Lightweight", r"\blight[- ]?weight\b"),
    ("Compression", r"\bcompress(?:ion|ive)\b"),
    ("Anti Odor", r"\banti[- ]?odou?r\b|\bodou?r control\b"),
    ("UPF Protection", r"\bUPF\s*\d*\+?\b|\bUV protection\b"),
    ("Thermal", r"\bthermal\b|\binsulat(?:ed|ion)\b"),
    ("Soft Handfeel", r"\bsoft (?:hand|feel|touch)\b|\bbuttery soft\b"),
)

FIBER_PATTERN = re.compile(
    r"\b(?:cotton|polyester|nylon|polyamide|elastane|spandex|wool|merino|"
    r"viscose|rayon|modal|lyocell|acrylic|bamboo)\b",
    re.I,
)


def _dedupe(values: list[Any]) -> list[str]:
    result: list[str] = []
    seen: set[str] = set()
    for value in values:
        text = re.sub(r"\s+", " ", str(value or "")).strip(" -|,")
        key = text.casefold()
        if text and key not in seen:
            seen.add(key)
            result.append(text)
    return result


def _tag_values(tags: list[str], prefixes: tuple[str, ...]) -> list[str]:
    values: list[str] = []
    for tag in tags:
        for prefix in prefixes:
            if tag.lower().startswith(prefix.lower()):
                values.append(tag[len(prefix) :])
                break
    return _dedupe(values)


def _category(product_type: str) -> str | None:
    lowered = product_type.lower().strip()
    if not lowered.startswith(("womens ", "mens ", "unisex ", "kids ")):
        return None
    for keyword, category in APPAREL_CATEGORIES.items():
        if re.search(rf"\b{re.escape(keyword)}\b", lowered):
            return category
    return None


def _audiences(product_type: str, tags: list[str]) -> tuple[list[str], list[str]]:
    text = f"{product_type} {' '.join(tags)}".lower()
    if re.search(r"\bunisex\b", text):
        return ["men", "women"], ["Men", "Women"]
    if re.search(r"\bwomens?\b|\bwomen'?s\b", text):
        return ["women"], ["Women"]
    if re.search(r"\bmens?\b|\bmen'?s\b", text):
        return ["men"], ["Men"]
    if re.search(r"\bkids?\b|\byouth\b", text):
        return ["kids"], ["Kids"]
    return [], []


def _material_details(html: str, tags: list[str]) -> list[str]:
    details = [f"Body: {value}" for value in _tag_values(tags, ("fabric:", "fabric_"))]
    soup = BeautifulSoup(html or "", "html.parser")
    for value in soup.stripped_strings:
        text = re.sub(r"\s+", " ", value).strip()
        if FIBER_PATTERN.search(text) and ("%" in text or len(text) <= 90):
            details.append(f"Body: {text}")
    return _dedupe(details)


def _innovations(description: str, tags: list[str]) -> list[str]:
    text = f"{description} {' '.join(tags)}"
    return [
        label
        for label, pattern in INNOVATION_PATTERNS
        if re.search(pattern, text, re.I)
    ]


def _shop_highlights(tags: list[str]) -> list[str]:
    text = " ".join(tags).lower()
    highlights: list[str] = []
    if re.search(r"\bbest\s*seller(?:s)?\b|\bbestsellers\b", text):
        highlights.append("Best Sellers")
    if re.search(r"\bnew\s*arrival(?:s)?\b|\bnew_arrivals?\b", text):
        highlights.append("New Arrivals")
    if re.search(r"\b(?:sale|finalsale|final sale)\b", text):
        highlights.append("Sale")
    return highlights


def _variant_colors(
    product: dict[str, Any],
) -> tuple[list[str], list[str], list[dict[str, Any]]]:
    variants = product.get("variants") or []
    images = {
        image.get("id"): str(image.get("src") or "")
        for image in product.get("images", [])
        if isinstance(image, dict)
    }
    color_index = 0
    for index, option in enumerate(product.get("options", []), start=1):
        if str(option.get("name", "")).lower() in {"color", "colour"}:
            color_index = index
            break

    rows: dict[str, dict[str, Any]] = {}
    for variant in variants:
        color = str(variant.get(f"option{color_index}") or "").strip()
        if not color:
            continue
        row = rows.setdefault(
            color,
            {
                "color": color,
                "image": images.get(variant.get("image_id"), ""),
                "url": f"{BASE_URL}/products/{product.get('handle', '')}",
                "available": False,
                "sizes": [],
            },
        )
        row["available"] = row["available"] or bool(variant.get("available"))
        size = str(variant.get("option2") or "").strip()
        if size and size not in row["sizes"]:
            row["sizes"].append(size)

    color_variants = list(rows.values())
    available = [row["color"] for row in color_variants if row["available"]]
    unavailable = [row["color"] for row in color_variants if not row["available"]]
    return available, unavailable, color_variants


def _normalize(product: dict[str, Any]) -> dict[str, Any] | None:
    product_type = str(product.get("product_type") or "").strip()
    category = _category(product_type)
    if not category:
        return None

    title = str(product.get("title") or "").strip()
    handle = str(product.get("handle") or "").strip()
    tags = _dedupe(product.get("tags") or [])
    html = str(product.get("body_html") or "")
    description = _plain_text(html)
    variants = product.get("variants") or []
    prices = [
        float(variant["price"])
        for variant in variants
        if variant.get("price") not in (None, "")
    ]
    available_colors, unavailable_colors, color_variants = _variant_colors(product)
    all_colors = _dedupe([*available_colors, *unavailable_colors])
    materials = _material_details(html, tags)
    innovations = _innovations(description, tags)
    audiences, audience_labels = _audiences(product_type, tags)
    activities = _tag_values(tags, ("activityis:", "pillar_", "Pillar_"))
    collections = _tag_values(tags, ("range:", "range_"))
    subcategories = _dedupe(
        [
            *_tag_values(tags, ("scat:", "buysubcate_")),
            product_type,
            category,
        ]
    )
    images = product.get("images") or []
    image = product.get("image") or (images[0] if images else {})
    image_url = str(image.get("src") or "") if isinstance(image, dict) else ""
    shop_highlights = _shop_highlights(tags)
    available = any(bool(variant.get("available")) for variant in variants)

    return {
        "id": f"lskd:{product.get('id', handle)}",
        "source_id": str(product.get("id", handle)),
        "product_id": str(product.get("id", handle)),
        "brand": "lskd",
        "brand_label": "LSKD",
        "source": BASE_URL,
        "title": title,
        "handle": handle,
        "description": description,
        "category": category,
        "categories": [category],
        "subcategories": subcategories,
        "collections": collections,
        "activities": activities,
        "features": _tag_values(tags, ("fit:", "style:")),
        "shop_highlights": shop_highlights,
        "vendor": str(product.get("vendor") or "LSKD"),
        "audiences": audiences,
        "audience_labels": audience_labels,
        "price_min": min(prices, default=0),
        "price_max": max(prices, default=0),
        "price_known": bool(prices),
        "available": available,
        "availability_known": True,
        "variant_count": len(variants),
        "color": " / ".join(available_colors or all_colors),
        "available_colors": available_colors,
        "unavailable_colors": unavailable_colors,
        "all_colors": all_colors,
        "color_variants": color_variants,
        "image": image_url,
        "url": f"{BASE_URL}/products/{handle}",
        "material": " | ".join(materials),
        "material_details": materials,
        "technical_features": innovations,
        "fabric_treatment": [],
        "construction": [],
        "innovations": innovations,
        "detail_status": "enriched" if description else "catalog_only",
        "product_functions": extract_product_functions(
            title, description, tags, " | ".join(materials)
        ),
        "top_seller": "Best Sellers" in shop_highlights,
        "published_at": product.get("published_at"),
        "updated_at": product.get("updated_at"),
    }


async def _all_products(client: httpx.AsyncClient) -> list[dict[str, Any]]:
    products: list[dict[str, Any]] = []
    for page in range(1, MAX_PAGES + 1):
        response: httpx.Response | None = None
        for attempt in range(MAX_RETRIES):
            response = await client.get(
                PRODUCT_FEED_PATH,
                params={"limit": PAGE_SIZE, "page": page},
            )
            if response.status_code not in {429, 500, 502, 503, 504}:
                break
            await asyncio.sleep(min(2 ** attempt, 16))
        if response is None:
            break
        response.raise_for_status()
        batch = response.json().get("products", [])
        products.extend(
            normalized
            for normalized in (_normalize(product) for product in batch)
            if normalized is not None
        )
        if len(batch) < PAGE_SIZE:
            break
        del batch
        del response
        gc.collect()
        await asyncio.sleep(0.25)
    return products


async def scrape_lskd_products() -> dict[str, Any]:
    headers = {
        "User-Agent": "MultiBrandCatalogDashboard/1.0 (+public product analytics)",
        "Accept": "application/json,text/plain,*/*",
    }
    timeout = httpx.Timeout(60.0, connect=20.0)
    async with httpx.AsyncClient(
        base_url=BASE_URL,
        headers=headers,
        timeout=timeout,
        follow_redirects=True,
    ) as client:
        products = await _all_products(client)
    products.sort(key=lambda item: item["title"].lower())
    return {
        "source": BASE_URL,
        "scraped_at": datetime.now(timezone.utc).isoformat(),
        "product_count": len(products),
        "products": products,
        "collection_options": sorted(
            {value for product in products for value in product["collections"]},
            key=str.lower,
        ),
    }
