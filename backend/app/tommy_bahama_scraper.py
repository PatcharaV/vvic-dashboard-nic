import asyncio
import html
import json
import re
import xml.etree.ElementTree as ET
from datetime import datetime, timezone
from typing import Any
from urllib.parse import unquote

import httpx

from .scraper import extract_product_functions

BASE_URL = "https://www.tommybahama.com"
SITEMAP_URL = f"{BASE_URL}/sitemap.xml"
SITEMAP_NS = {"sm": "http://www.sitemaps.org/schemas/sitemap/0.9"}

INCLUDE_URL_KEYWORDS = {
    "blazer",
    "cardigan",
    "caftan",
    "coverup",
    "dress",
    "hoodie",
    "jacket",
    "jean",
    "jumpsuit",
    "legging",
    "linen",
    "pant",
    "polo",
    "pullover",
    "rash",
    "romper",
    "shirt",
    "short",
    "skirt",
    "skort",
    "sweater",
    "sweatshirt",
    "swim",
    "t-shirt",
    "tank",
    "tee",
    "trunk",
    "vest",
}

EXCLUDE_URL_KEYWORDS = {
    "bag",
    "beach-chair",
    "belt",
    "blanket",
    "bowl",
    "bracelet",
    "candle",
    "cap",
    "chair",
    "cleaner",
    "cooler",
    "decor",
    "diffuser",
    "earring",
    "flip",
    "furniture",
    "gift",
    "glass",
    "hat",
    "flask",
    "mat",
    "maui-jim",
    "mug",
    "necklace",
    "ornament",
    "perfume",
    "pillow",
    "plate",
    "pouch",
    "quilt",
    "ring",
    "rug",
    "sandal",
    "sheet",
    "shelter",
    "shoe",
    "soap",
    "sunglasses",
    "shortbread",
    "tote",
    "towel",
    "umbrella",
    "wallet",
    "watch",
}

CLOTHING_CATEGORIES = {
    "Dresses",
    "Hoodies & Sweatshirts",
    "Jeans",
    "Outerwear",
    "Pants",
    "Polos",
    "Shirts",
    "Shorts",
    "Skirts",
    "Sweaters",
    "Swim",
    "T-Shirts",
    "Tanks",
}

FIBER_TERMS = (
    r"cotton|polyester|nylon|polyamide|elastane|wool|linen|spandex|"
    r"viscose|rayon|modal|lyocell|tencel|silk|leather|suede|recycled polyester"
)


def _dedupe(values: list[str]) -> list[str]:
    deduped: list[str] = []
    for value in values:
        value = str(value or "").strip()
        if value and value not in deduped:
            deduped.append(value)
    return deduped


def _plain_text(value: Any) -> str:
    text = html.unescape(str(value or ""))
    text = re.sub(r"<br\s*/?>", " | ", text, flags=re.I)
    text = re.sub(r"</(?:p|div|li)>", " | ", text, flags=re.I)
    text = re.sub(r"<[^>]+>", " ", text)
    return re.sub(r"\s+", " ", text).strip(" |")


def _detail_bullets(detail: dict[str, Any] | None) -> list[str]:
    if not isinstance(detail, dict):
        return []
    bullets = detail.get("productBullets")
    if not isinstance(bullets, dict):
        return []

    def bullet_index(item: tuple[str, Any]) -> int:
        match = re.search(r"(\d+)$", item[0])
        return int(match.group(1)) if match else 999

    return [
        text
        for _, raw in sorted(bullets.items(), key=bullet_index)
        if (text := _plain_text(raw))
    ]


def _material_bullets(bullets: list[str]) -> list[str]:
    material_lines: list[str] = []
    for bullet in bullets[:3]:
        text = bullet.strip(" .")
        if not re.search(FIBER_TERMS, text, re.I):
            continue
        if re.search(
            r"\b(?:machine wash|wash|dry clean|clean only|tumble dry|do not bleach|iron)\b",
            text,
            re.I,
        ):
            continue
        material_lines.append(text)
    return _dedupe(material_lines)


def _base_product_code(code: str) -> str:
    return code.rsplit("-", 1)[0] if "-" in code else code


async def _product_detail(client: httpx.AsyncClient, code: str) -> dict[str, Any] | None:
    candidates = _dedupe([code, _base_product_code(code)])
    for candidate in candidates:
        for attempt in range(3):
            try:
                response = await client.get(f"/p/{candidate}/getProductDetail.json")
                response.raise_for_status()
                data = response.json()
            except (httpx.HTTPError, json.JSONDecodeError):
                if attempt < 2:
                    await asyncio.sleep(0.4 * (attempt + 1))
                continue
            if isinstance(data, dict):
                return data
    return None


async def _product_feed(client: httpx.AsyncClient, code: str) -> list[dict[str, Any]]:
    candidates = _dedupe([_base_product_code(code), code])
    for candidate in candidates:
        for attempt in range(3):
            try:
                response = await client.get(
                    f"/p/{candidate}/detailSummary/getProductFeedEom.json",
                    params={"currency": "USD", "ts": "1"},
                )
                response.raise_for_status()
                data = response.json()
            except (httpx.HTTPError, json.JSONDecodeError):
                if attempt < 2:
                    await asyncio.sleep(0.4 * (attempt + 1))
                continue
            if isinstance(data, list):
                return [item for item in data if isinstance(item, dict)]
    return []


def _feed_by_code(feed: list[dict[str, Any]]) -> dict[str, dict[str, Any]]:
    return {
        str(item.get("productCode") or ""): item
        for item in feed
        if item.get("productCode")
    }


def _feed_color(feed: list[dict[str, Any]], code: str, fallback: str) -> str:
    item = _feed_by_code(feed).get(code)
    color = str(item.get("colorName") or "").strip() if item else ""
    return color or fallback


def _feed_available(item: dict[str, Any]) -> bool:
    sizes = item.get("sizes")
    if isinstance(sizes, list):
        return any(int(size.get("availability") or 0) > 0 for size in sizes if isinstance(size, dict))
    try:
        return int(item.get("availability") or 0) > 0
    except (TypeError, ValueError):
        return bool(item.get("availability"))


def _feed_image(item: dict[str, Any]) -> str:
    image = str(item.get("scene7Url") or "").strip()
    if image:
        return f"{image}?$v26_pdp_alt_desktop$"
    return ""


def _color_variants_from_feed(feed: list[dict[str, Any]]) -> list[dict[str, Any]]:
    variants: list[dict[str, Any]] = []
    for item in feed:
        code = str(item.get("productCode") or "").strip()
        color = str(item.get("colorName") or "").strip()
        if not code or not color:
            continue
        variants.append(
            {
                "color": color,
                "image": _feed_image(item),
                "url": f"{BASE_URL}/p/{code}",
                "available": _feed_available(item),
            }
        )
    return variants


async def _sitemap_locs(client: httpx.AsyncClient, url: str) -> list[str]:
    response = await client.get(url)
    response.raise_for_status()
    root = ET.fromstring(response.text)
    return [
        loc.text.strip()
        for loc in root.findall(".//sm:loc", SITEMAP_NS)
        if loc.text and loc.text.strip()
    ]


def _candidate_url(url: str) -> bool:
    path = unquote(url).lower()
    tokens = {token for token in re.split(r"[^a-z0-9]+", path) if token}
    normalized_tokens = set(tokens)
    for token in tokens:
        if token.endswith("ies") and len(token) > 3:
            normalized_tokens.add(f"{token[:-3]}y")
        if token.endswith("es") and len(token) > 2:
            normalized_tokens.add(token[:-2])
        if token.endswith("s") and len(token) > 1:
            normalized_tokens.add(token[:-1])
    return bool(normalized_tokens & INCLUDE_URL_KEYWORDS) and not bool(
        normalized_tokens & EXCLUDE_URL_KEYWORDS
    )


async def _product_urls(client: httpx.AsyncClient) -> list[str]:
    sitemap_urls = await _sitemap_locs(client, SITEMAP_URL)
    product_sitemaps = [url for url in sitemap_urls if "TBProduct" in url]
    product_urls: list[str] = []
    for sitemap in product_sitemaps:
        try:
            urls = await _sitemap_locs(client, sitemap)
        except (httpx.HTTPError, ET.ParseError):
            continue
        product_urls.extend(url for url in urls if _candidate_url(url))
        await asyncio.sleep(0.1)
    return _dedupe(product_urls)


def _load_ld_product(html: str) -> dict[str, Any] | None:
    for match in re.finditer(
        r'<script[^>]+type=["\']application/ld\+json["\'][^>]*>(.*?)</script>',
        html,
        flags=re.I | re.S,
    ):
        raw = match.group(1).strip()
        try:
            data = json.loads(raw)
        except json.JSONDecodeError:
            continue
        items = data if isinstance(data, list) else [data]
        for item in items:
            if isinstance(item, dict) and str(item.get("@type", "")).lower() in {
                "product",
                "productgroup",
            }:
                return item
    return None


def _product_code(url: str, product: dict[str, Any]) -> str:
    match = re.search(r"/p/([^/?#]+)", url)
    return str(product.get("sku") or product.get("productGroupID") or (match.group(1) if match else url))


def _title_from_url(url: str) -> str:
    match = re.search(r"/en/([^/]+)/p/", url)
    if not match:
        return ""
    title = unquote(match.group(1)).replace("-", " ")
    return re.sub(r"\s+", " ", title).strip()


def _code_from_url(url: str) -> str:
    match = re.search(r"/p/([^/?#]+)", url)
    return unquote(match.group(1)) if match else url


def _image_from_code(code: str) -> str:
    image_code = code.replace("-", "_")
    return f"https://tommybahama.scene7.com/is/image/TommyBahama/{image_code}_main?$v26_pdp_alt_desktop$"


def _category(title: str, ld_categories: Any) -> str:
    category_text = " ".join(ld_categories if isinstance(ld_categories, list) else [ld_categories or ""])
    text = f"{title} {category_text}".lower()
    if "swim" in text or "trunk" in text or "rash guard" in text:
        return "Swim"
    if "dress" in text or "romper" in text or "jumpsuit" in text or "caftan" in text:
        return "Dresses"
    if "skort" in text or "skirt" in text:
        return "Skirts"
    if "jean" in text:
        return "Jeans"
    if "pant" in text or "legging" in text:
        return "Pants"
    if "short" in text and "shirt" not in text:
        return "Shorts"
    if "polo" in text:
        return "Polos"
    if "t-shirt" in text or "tee" in text:
        return "T-Shirts"
    if "tank" in text:
        return "Tanks"
    if "sweater" in text or "cardigan" in text:
        return "Sweaters"
    if "hoodie" in text or "pullover" in text or "sweatshirt" in text:
        return "Hoodies & Sweatshirts"
    if "jacket" in text or "vest" in text or "blazer" in text:
        return "Outerwear"
    if "shirt" in text:
        return "Shirts"
    return "Other"


def _audiences(title: str, code: str, category: str) -> tuple[list[str], list[str]]:
    text = f"{title} {code}".lower()
    code_upper = code.upper()
    if re.search(r"\bwomen'?s\b|\bladies\b", text) or code.upper().startswith("TW") or category in {
        "Dresses",
        "Skirts",
    }:
        return ["women"], ["Women"]
    if code_upper.startswith(("SW", "TW", "TSW")):
        return ["women"], ["Women"]
    if re.search(r"\bmen'?s\b|\bmens\b", text) or code_upper.startswith(
        ("ST", "BT", "TR", "T", "TB", "SS")
    ):
        return ["men"], ["Men"]
    return ["unisex"], ["Unisex"]


def _offers(product: dict[str, Any]) -> list[dict[str, Any]]:
    variants = product.get("hasVariant")
    if isinstance(variants, list):
        offers = []
        for variant in variants:
            offer = variant.get("offers") if isinstance(variant, dict) else None
            if isinstance(offer, dict):
                offers.append(offer)
        if offers:
            return offers
    offer = product.get("offers")
    if isinstance(offer, dict):
        return [offer]
    if isinstance(offer, list):
        return [item for item in offer if isinstance(item, dict)]
    return []


def _prices(product: dict[str, Any]) -> list[float]:
    prices = []
    for offer in _offers(product):
        try:
            prices.append(float(offer.get("price")))
        except (TypeError, ValueError):
            continue
    return prices


def _available(product: dict[str, Any]) -> bool:
    offers = _offers(product)
    if not offers:
        return True
    return any("instock" in str(offer.get("availability", "")).lower() for offer in offers)


def _images(product: dict[str, Any]) -> list[str]:
    image = product.get("image")
    if isinstance(image, list):
        return [str(item) for item in image if str(item).strip()]
    if image:
        return [str(image)]
    return []


def _collections(title: str) -> list[str]:
    text = title.lower()
    keywords = {
        "Boracay": "Boracay",
        "IslandZone": "IslandZone",
        "Bali": "Bali",
        "Two Palms": "Two Palms",
        "Bahama Survivor": "Bahama Survivor",
        "Collegiate": "Collegiate",
        "Big & Tall": "Big & Tall",
    }
    return [label for needle, label in keywords.items() if needle.lower() in text]


def _normalize(url: str, html: str) -> dict[str, Any] | None:
    product = _load_ld_product(html)
    if not product:
        return None
    title = str(product.get("name") or "").strip()
    code = _product_code(url, product)
    category = _category(title, product.get("category"))
    if category not in CLOTHING_CATEGORIES:
        return None
    prices = _prices(product)
    color = str(product.get("color") or "").strip()
    images = _images(product)
    audiences, audience_labels = _audiences(title, code, category)
    description = str(product.get("description") or "").strip()
    material_details = []
    material_match = re.search(
        r"((?:\d+(?:\.\d+)?%\s+(?:cotton|linen|silk|polyester|nylon|spandex|modal|rayon|viscose|elastane|tencel|lyocell|wool)(?:,?\s*|\s+and\s+)?)+)",
        description,
        flags=re.I,
    )
    if material_match:
        material_details.append(material_match.group(1).strip(" ,."))
    return {
        "id": f"tommybahama:{code}",
        "source_id": code,
        "product_id": code,
        "brand": "tommybahama",
        "brand_label": "Tommy Bahama",
        "source": BASE_URL,
        "title": title,
        "handle": code,
        "description": description,
        "category": category,
        "categories": [category],
        "subcategories": [category],
        "collections": _collections(title),
        "features": [],
        "shop_highlights": [],
        "vendor": "Tommy Bahama",
        "audiences": audiences,
        "audience_labels": audience_labels,
        "price_min": min(prices, default=0),
        "price_max": max(prices, default=0),
        "available": _available(product),
        "variant_count": len(product.get("hasVariant") or []) or 1,
        "color": color,
        "tags": [],
        "image": images[0] if images else "",
        "url": url,
        "material": " | ".join(material_details),
        "material_details": material_details,
        "product_functions": extract_product_functions(title, description, [], " | ".join(material_details)),
        "top_seller": False,
        "published_at": None,
        "updated_at": None,
    }


def _normalize_url(url: str) -> dict[str, Any] | None:
    title = _title_from_url(url)
    code = _code_from_url(url)
    category = _category(title, [])
    if not title or category not in CLOTHING_CATEGORIES:
        return None
    color = ""
    if "-" in code:
        color = code.rsplit("-", 1)[1]
    audiences, audience_labels = _audiences(title, code, category)
    return {
        "id": f"tommybahama:{code}",
        "source_id": code,
        "product_id": code,
        "brand": "tommybahama",
        "brand_label": "Tommy Bahama",
        "source": BASE_URL,
        "title": title,
        "handle": code,
        "description": "",
        "category": category,
        "categories": [category],
        "subcategories": [category],
        "collections": _collections(title),
        "features": [],
        "shop_highlights": [],
        "vendor": "Tommy Bahama",
        "audiences": audiences,
        "audience_labels": audience_labels,
        "price_min": 0,
        "price_max": 0,
        "price_known": False,
        "available": True,
        "variant_count": 1,
        "color": color,
        "tags": [],
        "image": _image_from_code(code),
        "url": url,
        "material": "",
        "material_details": [],
        "product_functions": extract_product_functions(title, "", [], ""),
        "top_seller": False,
        "published_at": None,
        "updated_at": None,
    }


async def _normalize_url_with_detail(
    client: httpx.AsyncClient,
    semaphore: asyncio.Semaphore,
    url: str,
) -> dict[str, Any] | None:
    product = _normalize_url(url)
    if product is None:
        return None

    async with semaphore:
        source_id = str(product["source_id"])
        detail, feed = await asyncio.gather(
            _product_detail(client, source_id),
            _product_feed(client, source_id),
        )

    feed_map = _feed_by_code(feed)
    feed_item = feed_map.get(str(product["source_id"]))
    color = _feed_color(feed, str(product["source_id"]), str(product.get("color") or ""))
    color_variants = _color_variants_from_feed(feed)
    available_colors = _dedupe(
        [variant["color"] for variant in color_variants if variant.get("available")]
    )
    unavailable_colors = _dedupe(
        [variant["color"] for variant in color_variants if not variant.get("available")]
    )
    if color:
        product["color"] = color
    if color_variants:
        product.update(
            {
                "color_variants": color_variants,
                "available_colors": available_colors,
                "unavailable_colors": unavailable_colors,
                "all_colors": _dedupe(available_colors + unavailable_colors),
                "available": _feed_available(feed_item) if feed_item else product["available"],
                "variant_count": max(len(color_variants), product.get("variant_count", 1)),
                "image": _feed_image(feed_item) if feed_item else product["image"],
            }
        )

    if not detail:
        return product

    title = _plain_text(detail.get("name")) or product["title"]
    description = _plain_text(detail.get("description"))
    bullets = _detail_bullets(detail)
    material_details = _material_bullets(bullets)
    description_parts = _dedupe([description, *bullets])
    detail_text = " ".join(description_parts)

    product.update(
        {
            "title": title,
            "description": detail_text,
            "material": " | ".join(material_details),
            "material_details": material_details,
            "product_functions": extract_product_functions(
                title,
                detail_text,
                [],
                " | ".join(material_details),
            ),
            "available": bool(detail.get("activeStatus", product["available"])),
            "image": str(detail.get("thumbnailUrl") or product["image"]).replace(
                "$v26_pdp_recs_desktop$",
                "?$v26_pdp_alt_desktop$",
            ),
        }
    )
    if detail.get("new") is True:
        product["shop_highlights"] = _dedupe([*product["shop_highlights"], "New Arrivals"])
    return product


async def scrape_tommy_bahama_products() -> dict[str, Any]:
    headers = {
        "User-Agent": "MultiBrandCatalogDashboard/1.0 (+public product analytics)",
        "Accept": "application/json,text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    }
    timeout = httpx.Timeout(45.0, connect=15.0)
    async with httpx.AsyncClient(
        base_url=BASE_URL,
        headers=headers,
        timeout=timeout,
        follow_redirects=True,
    ) as client:
        urls = await _product_urls(client)
        semaphore = asyncio.Semaphore(4)
        products = [
            product
            for product in await asyncio.gather(
                *(_normalize_url_with_detail(client, semaphore, url) for url in urls)
            )
            if product is not None
        ]

    products.sort(key=lambda item: item["title"].lower())
    return {
        "source": BASE_URL,
        "scraped_at": datetime.now(timezone.utc).isoformat(),
        "product_count": len(products),
        "products": products,
    }
