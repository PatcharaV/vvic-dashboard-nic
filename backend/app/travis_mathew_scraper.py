import asyncio
import re
from datetime import datetime, timezone
from typing import Any

import httpx

from .scraper import _extract_material, _plain_text, extract_product_functions

BASE_URL = "https://travismathew.com"
PAGE_SIZE = 250

CLOTHING_TYPES = {
    "Active Top",
    "Button-Up",
    "Cardigan",
    "Crew",
    "Dress",
    "Full Zip",
    "Half Zip",
    "Hoodie",
    "Hoodies and Pullovers",
    "Jacket",
    "Jogger",
    "Legging",
    "Pant",
    "Polo",
    "Pullover",
    "Quarter Zip",
    "Shirts and Tops",
    "Short",
    "Skirt",
    "Skort",
    "Tank",
    "Tee",
    "Vest",
}

EXCLUDED_TYPES = {
    "Adjustable",
    "Ball Bag",
    "Ball Marker Set",
    "Beanie",
    "Blanket",
    "Boombox",
    "Bucket Hat",
    "Canteen",
    "Care Kit",
    "Cooler",
    "Cooler Bag",
    "Cooler Backpack",
    "Cooler Can",
    "Dad Hat",
    "Driver Cover",
    "Golf Bag",
    "Golf Shoe",
    "Golf Towel",
    "GPS Speaker",
    "Mug",
    "Running Shoe",
    "Snapback",
    "Spray",
    "Sunglasses",
    "Tumbler",
    "Wallet",
}


async def _all_products(client: httpx.AsyncClient) -> list[dict[str, Any]]:
    products: list[dict[str, Any]] = []
    for page in range(1, 80):
        response = None
        for attempt in range(4):
            response = await client.get(
                f"{BASE_URL}/products.json",
                params={"limit": PAGE_SIZE, "page": page},
            )
            if response.status_code != 429:
                break
            await asyncio.sleep(2.0 * (attempt + 1))
        if response is None:
            break
        response.raise_for_status()
        batch = response.json().get("products", [])
        products.extend(batch)
        if len(batch) < PAGE_SIZE:
            break
        await asyncio.sleep(0.75)
    return products


def _dedupe(values: list[str]) -> list[str]:
    deduped: list[str] = []
    for value in values:
        value = str(value or "").strip()
        if value and value not in deduped:
            deduped.append(value)
    return deduped


def _tag_values(tags: list[str], prefix: str) -> list[str]:
    prefix_lower = prefix.lower()
    return _dedupe(
        [
            tag[len(prefix) :].strip()
            for tag in tags
            if tag.lower().startswith(prefix_lower)
        ]
    )


def _audiences(title: str, handle: str, tags: list[str]) -> tuple[list[str], list[str]]:
    text = f"{title} {handle} {' '.join(tags)}".lower()
    if re.search(r"\bwomen'?s\b|\bladies\b|\bskort\b|\bdress\b", text):
        return ["women"], ["Women"]
    if re.search(r"\bmen'?s\b|\bmens\b", text):
        return ["men"], ["Men"]
    if re.search(r"\bboy'?s\b|\byouth\b|\bkids?\b", text):
        return ["kids"], ["Kids"]
    return ["men"], ["Men"]


def _category(product_type: str, title: str, handle: str) -> str:
    text = f"{product_type} {title} {handle}".lower()
    if "skort" in text or "skirt" in text:
        return "Skorts & Skirts"
    if "dress" in text:
        return "Dresses"
    if "legging" in text:
        return "Leggings"
    if "jogger" in text:
        return "Joggers"
    if "pant" in text:
        return "Pants"
    if "short" in text and "shirt" not in text:
        return "Shorts"
    if "polo" in text:
        return "Polos"
    if "button-up" in text or "button up" in text or "button-down" in text:
        return "Button-Ups"
    if "quarter zip" in text or "quarter-zip" in text or "half zip" in text:
        return "Quarter Zips"
    if "hoodie" in text or "pullover" in text or "crew" in text:
        return "Hoodies & Pullovers"
    if "jacket" in text or "vest" in text or "cardigan" in text:
        return "Outerwear"
    if "tank" in text:
        return "Tanks"
    if "tee" in text or "shirt" in text or "active top" in text:
        return "Tees"
    return product_type or "Other"


def _collections(title: str, handle: str, tags: list[str]) -> list[str]:
    text = f"{title} {handle} {' '.join(tags)}".lower()
    labels = []
    collection_keywords = {
        "Cloud": ("cloud",),
        "Open to Close": ("open to close", "open-to-close"),
        "Active": ("active", "moveknit"),
        "Beach Club": ("beach club",),
        "Campus Classic": ("campus classic",),
        "Cloud Waffle": ("cloud waffle",),
        "Daily Provisions": ("daily provisions",),
        "The Heater": ("heater",),
    }
    for label, needles in collection_keywords.items():
        if any(needle in text for needle in needles):
            labels.append(label)
    labels.extend(_tag_values(tags, "Collection_"))
    return _dedupe(labels)


def _highlights(tags: list[str]) -> list[str]:
    highlights = []
    lower_tags = [tag.lower() for tag in tags]
    if any("new" == tag or tag.startswith("new ") for tag in lower_tags):
        highlights.append("New Arrivals")
    if any("best" in tag and "seller" in tag for tag in lower_tags):
        highlights.append("Best Sellers")
    if any("sale" in tag for tag in lower_tags):
        highlights.append("Sale")
    return highlights


def _color(product: dict[str, Any]) -> str:
    for option in product.get("options", []):
        if str(option.get("name", "")).lower() in {"color", "colour"}:
            return " / ".join(str(value) for value in (option.get("values") or [])[:8])
    title = str(product.get("title", ""))
    if " - " in title:
        return title.rsplit(" - ", 1)[1].strip()
    return ""


def _normalize(product: dict[str, Any]) -> dict[str, Any] | None:
    product_type = str(product.get("product_type") or "").strip()
    if product_type in EXCLUDED_TYPES or product_type not in CLOTHING_TYPES:
        return None

    variants = product.get("variants") or []
    prices = [
        float(variant.get("price", 0))
        for variant in variants
        if variant.get("price") is not None
    ]
    images = product.get("images") or []
    image = product.get("image") or (images[0] if images else {})
    image_url = image.get("src", "") if isinstance(image, dict) else ""
    tags = sorted(set(str(tag) for tag in product.get("tags", [])))
    title = str(product.get("title", "")).strip()
    handle = str(product.get("handle", "")).strip()
    html = str(product.get("body_html", ""))
    description = _plain_text(html)
    material = _extract_material(html)
    category = _category(product_type, title, handle)
    audiences, audience_labels = _audiences(title, handle, tags)
    shop_highlights = _highlights(tags)
    return {
        "id": f"travismathew:{product.get('id', handle)}",
        "source_id": str(product.get("id", handle)),
        "product_id": str(product.get("id", handle)),
        "brand": "travismathew",
        "brand_label": "TravisMathew",
        "source": BASE_URL,
        "title": title,
        "handle": handle,
        "description": description,
        "category": category,
        "categories": [category],
        "subcategories": _dedupe([product_type, category]),
        "collections": _collections(title, handle, tags),
        "features": _tag_values(tags, "Feature_"),
        "shop_highlights": shop_highlights,
        "vendor": str(product.get("vendor") or "TravisMathew"),
        "audiences": audiences,
        "audience_labels": audience_labels,
        "price_min": min(prices, default=0),
        "price_max": max(prices, default=0),
        "available": any(bool(variant.get("available")) for variant in variants),
        "variant_count": len(variants),
        "color": _color(product),
        "tags": tags,
        "image": image_url,
        "url": f"{BASE_URL}/products/{handle}",
        "material": material,
        "material_details": [material] if material else [],
        "product_functions": extract_product_functions(title, description, tags, material),
        "top_seller": "Best Sellers" in shop_highlights,
        "published_at": product.get("published_at"),
        "updated_at": product.get("updated_at"),
    }


async def scrape_travis_mathew_products() -> dict[str, Any]:
    headers = {
        "User-Agent": "MultiBrandCatalogDashboard/1.0 (+public product analytics)",
        "Accept": "application/json,text/plain,*/*",
    }
    timeout = httpx.Timeout(45.0, connect=15.0)
    async with httpx.AsyncClient(headers=headers, timeout=timeout) as client:
        products = await _all_products(client)

    normalized = [
        product
        for product in (_normalize(product) for product in products)
        if product is not None
    ]
    normalized.sort(key=lambda item: item["title"].lower())
    return {
        "source": BASE_URL,
        "scraped_at": datetime.now(timezone.utc).isoformat(),
        "product_count": len(normalized),
        "products": normalized,
    }
