import asyncio
import json
import re
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from .arcteryx_scraper import scrape_arcteryx_products
from .lululemon_scraper import scrape_lululemon_products
from .quality import (
    backup_file,
    build_audit_report,
    product_key,
    summarize_brand,
    utc_stamp,
    validate_brand,
    write_json,
)
from .rhone_scraper import scrape_rhone_products
from .scraper import extract_product_functions, scrape_strauss_products
from .tommy_bahama_scraper import scrape_tommy_bahama_products
from .travis_mathew_scraper import scrape_travis_mathew_products

DATA_DIR = Path(__file__).resolve().parents[1] / "data"
CACHE_PATH = DATA_DIR / "products.json"
LULULEMON_DETAIL_PATH = DATA_DIR / "lululemon_details.json"
HISTORY_DIR = DATA_DIR / "history"
STAGING_DIR = DATA_DIR / "staging"
AUDIT_DIR = DATA_DIR / "audits"
BACKUP_DIR = DATA_DIR / "backups"
BRAND_ARCHIVE_DIR = DATA_DIR / "NIC DASHBOARD"
BRAND_ARCHIVE_FOLDERS = {
    "strauss": "Strauss",
    "rhone": "Rhone",
    "arcteryx": "Arc'Teryx",
    "lululemon": "Lululemon",
    "tommybahama": "Tommy Bahama",
    "travismathew": "Travis Mathew",
}
MONTH_CODES = [
    "JAN",
    "FEB",
    "MAR",
    "APR",
    "MAY",
    "JUN",
    "JUL",
    "AUG",
    "SEP",
    "OCT",
    "NOV",
    "DEC",
]
HISTORY_START_YEAR = 2026
HISTORY_START_MONTH = 6
SEASON_LABELS = {
    "spring_summer": "Spring / Summer",
    "fall_winter": "Fall / Winter",
    "all": "All seasons",
}

SPRING_SUMMER_KEYWORDS = {
    "athletic shorts",
    "breathable",
    "capris",
    "dress",
    "dresses",
    "golf short",
    "half tights",
    "light layers",
    "lightweight",
    "liner shorts",
    "polo",
    "quick-drying",
    "shirt",
    "shirts",
    "short",
    "shorts",
    "skirt",
    "skort",
    "spring favorite",
    "summer",
    "summer essentials",
    "sun protection",
    "swim",
    "tank",
    "tank tops",
    "tee",
    "t-shirt",
    "t-shirts",
    "uv",
    "water-resistant stretch",
}

FALL_WINTER_KEYWORDS = {
    "base layer",
    "beanie",
    "coat",
    "corduroy",
    "crewneck",
    "down",
    "fall",
    "fleece",
    "full-zip",
    "hoodie",
    "hoodies",
    "insulated",
    "insulation",
    "jacket",
    "jackets",
    "merino",
    "midlayer",
    "minky",
    "pullover",
    "snow",
    "softshell",
    "sweater",
    "sweatpants",
    "sweatshirt",
    "sweatshirts",
    "thermal",
    "vest",
    "winter",
    "wool",
}

ALL_SEASON_KEYWORDS = {
    "all seasons",
    "bib",
    "bibs",
    "cargo pants",
    "coveralls",
    "denim",
    "double-front",
    "jeans",
    "joggers",
    "leggings",
    "overalls",
    "pants",
    "trouser",
    "trousers",
    "underwear",
    "work pants",
    "work shirts",
}


def period_key(scrape_period: dict[str, Any] | None) -> str:
    if not scrape_period:
        return "latest"
    month = str(scrape_period.get("month", "")).upper()
    year = int(scrape_period.get("year", 0) or 0)
    if month not in MONTH_CODES or not year:
        return "latest"
    return f"{year:04d}-{MONTH_CODES.index(month) + 1:02d}"


def period_label(scrape_period: dict[str, Any] | None) -> str:
    if not scrape_period:
        return ""
    month = str(scrape_period.get("month", "")).upper()
    year = scrape_period.get("year")
    return f"{month} {year}" if month and year else ""


def period_cache_path(scrape_period: dict[str, Any] | None) -> Path:
    return HISTORY_DIR / f"{period_key(scrape_period)}.json"


def available_periods() -> list[dict[str, Any]]:
    periods: list[dict[str, Any]] = []
    if not HISTORY_DIR.exists():
        return periods
    for path in sorted(HISTORY_DIR.glob("*.json")):
        match = re.fullmatch(r"(\d{4})-(\d{2})", path.stem)
        if not match:
            continue
        year = int(match.group(1))
        month_index = int(match.group(2)) - 1
        if month_index < 0 or month_index >= len(MONTH_CODES):
            continue
        periods.append(
            {
                "key": path.stem,
                "month": MONTH_CODES[month_index],
                "year": year,
                "label": f"{MONTH_CODES[month_index]} {year}",
            }
        )
    return periods


def load_latest_period_cache() -> dict[str, Any] | None:
    periods = available_periods()
    if not periods:
        return load_cache()
    return load_period_cache(periods[-1])
CLOTHING_CATEGORIES = {
    "strauss": {
        "Shirts",
        "Pants",
        "Outerwear",
        "Hoodies & Sweatshirts",
        "Shorts",
        "Leggings",
        "Thermal Layers",
    },
    "rhone": {
        "1/4 zips",
        "Blazers",
        "Button ups",
        "Dresses",
        "Hoodies & pullovers",
        "Leggings",
        "Outerwear",
        "Pants",
        "Polos",
        "Shorts",
        "Skirts",
        "Sports Bras",
        "Sweaters",
        "Swim",
        "Tanks",
        "Tees",
        "Underwear",
    },
    "arcteryx": {
        "Shell Jackets",
        "Insulated Jackets",
        "Base Layer",
        "Pants",
        "Fleece",
        "Shirts and Tops",
        "Shorts",
        "Vests",
        "Dresses and Skirts",
        "Collection Only",
    },
    "lululemon": {
        "Athletic Shorts",
        "Button Down Shirts",
        "Capris",
        "Coats & Jackets",
        "Dresses",
        "Dress Pants",
        "Hoodies & Sweatshirts",
        "Hoodies",
        "Jackets",
        "Joggers",
        "Leggings",
        "Liner Shorts",
        "Long Sleeve Shirts",
        "Pants",
        "Polo Shirts",
        "Quarter Zips",
        "Shirts",
        "Short Sleeve Shirts",
        "Shorts",
        "Skirts",
        "Sports Bras",
        "Sweatpants",
        "Sweatshirts",
        "Sweaters",
        "Swim",
        "Swim Trunks",
        "Tank Tops",
        "T-Shirts",
        "Trousers",
        "Underwear",
        "Vests",
    },
    "tommybahama": {
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
    },
    "travismathew": {
        "1/4 zips",
        "Blazers",
        "Button-Ups",
        "Dresses",
        "Hoodies & Pullovers",
        "Joggers",
        "Leggings",
        "Outerwear",
        "Pants",
        "Polos",
        "Quarter Zips",
        "Shorts",
        "Skorts & Skirts",
        "Tanks",
        "Tees",
        "Underwear",
    },
}


def _clothing_products(products: list[dict[str, Any]]) -> list[dict[str, Any]]:
    clothing: list[dict[str, Any]] = []
    for product in products:
        allowed = CLOTHING_CATEGORIES.get(str(product.get("brand")), set())
        categories = set(
            product.get("categories")
            or [str(product.get("category", "Other"))]
        )
        matched_categories = sorted(categories & allowed)
        if not matched_categories:
            continue
        shop_highlights = [
            str(highlight)
            for highlight in product.get("shop_highlights", [])
            if str(highlight).strip()
        ]
        features = [
            str(feature)
            for feature in product.get("features", [])
            if str(feature).strip()
        ]
        if product.get("top_seller") and "Topseller" not in shop_highlights:
            shop_highlights.append("Topseller")
        clothing.append(
            {
                **product,
                "category": matched_categories[0],
                "categories": matched_categories,
                "features": features,
                "shop_highlights": shop_highlights,
                "top_seller": "Topseller" in shop_highlights,
                "product_functions": product.get("product_functions")
                or extract_product_functions(
                    product.get("title", ""),
                    product.get("description", ""),
                    product.get("tags", []),
                    product.get("material", ""),
                ),
                "audiences": [
                    audience
                    for audience in product.get("audiences", [])
                    if audience not in {"footwear", "gear-accessories"}
                ],
                "audience_labels": [
                    label
                    for value, label in zip(
                        product.get("audiences", []),
                        product.get("audience_labels", []),
                    )
                    if value not in {"footwear", "gear-accessories"}
                ],
            }
        )
    return _enrich_brand_detail_fields(clothing)


def _season_text(product: dict[str, Any]) -> str:
    parts: list[str] = []
    for key in (
        "title",
        "description",
        "category",
        "material",
        "season_code",
        "season_range",
    ):
        value = product.get(key)
        if value:
            parts.append(str(value))
    for key in (
        "categories",
        "subcategories",
        "collections",
        "features",
        "shop_highlights",
        "activities",
        "tags",
        "material_details",
        "technical_features",
        "fabric_treatment",
        "construction",
        "innovations",
        "product_functions",
    ):
        values = product.get(key)
        if isinstance(values, list):
            parts.extend(str(value) for value in values if str(value).strip())
    return " ".join(parts).lower()


def _keyword_hits(text: str, keywords: set[str]) -> list[str]:
    return sorted(
        {
            keyword
            for keyword in keywords
            if re.search(rf"(?<![a-z0-9]){re.escape(keyword)}(?![a-z0-9])", text)
        },
        key=str.lower,
    )


def _normalize_season_label(value: str) -> str:
    normalized = re.sub(r"\s*/\s*", " / ", str(value or "").strip())
    normalized_lower = normalized.lower()
    if normalized_lower in {"spring / summer", "spring summer"}:
        return SEASON_LABELS["spring_summer"]
    if normalized_lower in {"fall / winter", "fall winter"}:
        return SEASON_LABELS["fall_winter"]
    if normalized_lower in {"all season", "all seasons"}:
        return SEASON_LABELS["all"]
    return normalized


def _infer_season(product: dict[str, Any]) -> dict[str, Any]:
    explicit_range = _normalize_season_label(product.get("season_range") or "")
    explicit_code = str(product.get("season_code") or "").strip()
    if explicit_range and not explicit_range.lower().startswith("inferred"):
        return {
            "season_code": explicit_code,
            "season_range": explicit_range,
            "season_source": product.get("season_source") or "Brand/product data",
            "season_notes": product.get("season_notes", []),
        }

    text = _season_text(product)
    ss_hits = _keyword_hits(text, SPRING_SUMMER_KEYWORDS)
    fw_hits = _keyword_hits(text, FALL_WINTER_KEYWORDS)
    all_hits = _keyword_hits(text, ALL_SEASON_KEYWORDS)

    if all_hits and not fw_hits and not ss_hits:
        label = SEASON_LABELS["all"]
        reason_hits = all_hits[:5]
    elif fw_hits and not ss_hits:
        label = SEASON_LABELS["fall_winter"]
        reason_hits = fw_hits[:5]
    elif ss_hits and not fw_hits:
        label = SEASON_LABELS["spring_summer"]
        reason_hits = ss_hits[:5]
    elif fw_hits and ss_hits:
        category_text = " ".join(
            product.get("categories") or [product.get("category", "")]
        ).lower()
        if any(
            word in category_text
            for word in ("shorts", "swim", "tank", "dresses", "skirts")
        ):
            label = SEASON_LABELS["spring_summer"]
            reason_hits = ss_hits[:5]
        elif any(
            word in category_text
            for word in ("insulated", "fleece", "thermal", "outerwear")
        ):
            label = SEASON_LABELS["fall_winter"]
            reason_hits = fw_hits[:5]
        else:
            label = SEASON_LABELS["all"]
            reason_hits = (all_hits or ss_hits + fw_hits)[:5]
    else:
        label = SEASON_LABELS["all"]
        reason_hits = ["general apparel"]

    return {
        "season_code": explicit_code,
        "season_range": label,
        "season_source": "Inferred from product attributes",
        "season_notes": [
            f"Matched keyword: {hit}" for hit in reason_hits if hit
        ],
    }


def _apply_season_classification(products: list[dict[str, Any]]) -> list[dict[str, Any]]:
    classified: list[dict[str, Any]] = []
    for product in products:
        season = _infer_season(product)
        classified.append(
            {
                **product,
                "season_code": season["season_code"],
                "season_range": season["season_range"],
                "season_source": season["season_source"],
                "season_notes": season["season_notes"],
            }
        )
    return classified


def _filter_period_products(
    products: list[dict[str, Any]],
    brand: str,
    scrape_period: dict[str, Any] | None,
) -> list[dict[str, Any]]:
    return products


def _normalize_strauss_categories(product: dict[str, Any]) -> dict[str, Any]:
    if product.get("brand") != "strauss":
        return product

    title = str(product.get("title", "")).lower()
    raw_categories = list(
        product.get("categories")
        or [str(product.get("category", "Other"))]
    )
    categories = [
        category
        for category in raw_categories
        if category != "Thermal Layers" or len(raw_categories) == 1
    ]
    subcategories = [
        subcategory
        for subcategory in product.get("subcategories", [])
        if subcategory not in {"Men's Thermal Layers", "Women's Thermal Layers"}
    ]

    categories = categories or ["Other"]
    features = [
        feature
        for feature in product.get("features", [])
        if feature
    ]
    if "Thermal Layers" in features and categories == ["Other"]:
        categories = ["Thermal Layers"]
        if "pant" in title:
            subcategories = ["Thermal Pants"]
    shop_highlights = [
        highlight
        for highlight in product.get("shop_highlights", [])
        if highlight
    ]
    if product.get("top_seller") and "Topseller" not in shop_highlights:
        shop_highlights.append("Topseller")
    return {
        **product,
        "category": categories[0],
        "categories": categories,
        "subcategories": subcategories,
        "features": features,
        "shop_highlights": shop_highlights,
        "top_seller": "Topseller" in shop_highlights,
    }


def _dedupe_strings(values: Any) -> list[str]:
    deduped: list[str] = []
    items = values if isinstance(values, list) else [values]
    for item in items:
        value = (
            str(item or "")
            .replace("โข", "TM")
            .replace("™", "TM")
            .strip()
        )
        if value and value not in deduped:
            deduped.append(value)
    return deduped


def _infer_tommy_bahama_material(product: dict[str, Any]) -> list[str]:
    text = " ".join(
        [
            str(product.get("title") or ""),
            str(product.get("description") or ""),
            str(product.get("handle") or ""),
            " ".join(product.get("collections") or []),
        ]
    ).lower()
    materials: list[str] = []
    for pattern, label in (
        (r"\bsilk\b", "Silk"),
        (r"\blinen\b|two palms", "Linen"),
        (r"\bcotton\b", "Cotton"),
        (r"\bdenim\b|jean", "Cotton denim"),
        (r"\bmodal\b", "Modal"),
        (r"\brayon\b|viscose", "Rayon / Viscose"),
        (r"\bpolyester\b|swim|rash guard|islandzone", "Polyester performance fabric"),
        (r"\bspandex\b|stretch|boracay", "Stretch blend"),
    ):
        if re.search(pattern, text, re.I) and label not in materials:
            materials.append(label)
    return materials


def _infer_travis_mathew_material(product: dict[str, Any]) -> list[str]:
    text = " ".join(
        [
            str(product.get("title") or ""),
            str(product.get("description") or ""),
            str(product.get("handle") or ""),
            " ".join(product.get("collections") or []),
            " ".join(product.get("tags") or []),
        ]
    ).lower()
    materials: list[str] = []
    for pattern, label in (
        (r"\b100%\s*organic cotton\b", "100% Organic cotton"),
        (r"\b100%\s*cotton\b", "100% Cotton"),
        (r"\bcotton\b", "Cotton blend"),
        (r"\bpolyester\b", "Polyester blend"),
        (r"\bspandex\b|elastane\b|stretch|open to close", "Stretch blend"),
        (r"\bmesh\b", "Mesh fabric"),
        (r"\bcloud waffle\b", "Cloud Waffle fabric"),
        (r"\bcloud\b", "Cloud fabric"),
        (r"\bmoveknit\b|active collection|active top|active bottom", "MoveKnit / active performance fabric"),
        (r"\bheater\b", "Heater performance fabric"),
        (r"\btour guide\b", "Tour Guide performance fabric"),
        (r"\bskyloft\b", "Skyloft soft fabric"),
    ):
        if re.search(pattern, text, re.I) and label not in materials:
            materials.append(label)
    return materials


def _infer_brand_innovations(product: dict[str, Any]) -> list[str]:
    text = " ".join(
        [
            str(product.get("title") or ""),
            str(product.get("description") or ""),
            str(product.get("material") or ""),
            " ".join(product.get("material_details") or []),
            " ".join(product.get("collections") or []),
            " ".join(product.get("tags") or []),
            " ".join(product.get("product_functions") or []),
        ]
    ).lower()
    innovations: list[str] = []
    for pattern, label in (
        (r"\bislandzone\b|cool|breathable|ventilat", "Breathable / cooling comfort"),
        (r"\bstretch\b|spandex|elastane|open to close|boracay", "Stretch comfort"),
        (r"\bquick[- ]?dry|dries quickly|moisture[- ]?wick|wicking", "Quick-dry / moisture-wicking"),
        (r"\bupf|sun protection|rash guard", "Sun protection"),
        (r"\blightweight\b|skyloft", "Lightweight comfort"),
        (r"\bwrinkle\b|travel\b", "Travel-ready wrinkle resistance"),
        (r"\bwaterproof|water[- ]?repellent|water resistant", "Water protection"),
        (r"\binsulat|thermal|heater", "Warmth / thermal comfort"),
        (r"\bcloud\b|cloud waffle", "Soft handfeel"),
        (r"\bmoveknit|active collection|active top|active bottom", "Active performance"),
        (r"\btour guide\b", "Golf performance fabric"),
    ):
        if re.search(pattern, text, re.I) and label not in innovations:
            innovations.append(label)
    return innovations


def _enrich_brand_detail_fields(products: list[dict[str, Any]]) -> list[dict[str, Any]]:
    enriched: list[dict[str, Any]] = []
    for product in products:
        brand = product.get("brand")
        if brand not in {"tommybahama", "travismathew"}:
            enriched.append(product)
            continue

        material_details = _dedupe_strings(product.get("material_details") or [])
        if not material_details:
            material_details = (
                _infer_tommy_bahama_material(product)
                if brand == "tommybahama"
                else _infer_travis_mathew_material(product)
            )
        material = " | ".join(material_details) or str(product.get("material") or "")
        product_functions = product.get("product_functions") or extract_product_functions(
            product.get("title", ""),
            product.get("description", ""),
            product.get("tags", []),
            material,
        )
        innovation_input = {
            **product,
            "material": material,
            "material_details": material_details,
            "product_functions": product_functions,
        }
        innovations = _dedupe_strings(
            [*(product.get("innovations") or []), *_infer_brand_innovations(innovation_input)]
        )
        enriched.append(
            {
                **product,
                "material": material,
                "material_details": material_details,
                "product_functions": product_functions,
                "innovations": innovations,
            }
        )
    return enriched


def _lululemon_product_id_from_url(url: str) -> str:
    match = re.search(r"/_/([^/?#]+)", str(url))
    return match.group(1) if match else ""


def _lululemon_style_number(color_variants: list[dict[str, Any]]) -> str:
    for variant in color_variants:
        image = str(variant.get("image") or "")
        match = re.search(r"/([^/?]+)_\d+_", image)
        if match:
            return match.group(1)
    return ""


def load_lululemon_detail_cache(
    path: Path = LULULEMON_DETAIL_PATH,
) -> dict[str, dict[str, Any]]:
    if not path.exists():
        return {}
    try:
        raw = json.loads(path.read_text(encoding="utf-8"))
    except (json.JSONDecodeError, OSError):
        return {}
    rows = raw.get("products") if isinstance(raw, dict) else raw
    if not isinstance(rows, list):
        return {}

    details: dict[str, dict[str, Any]] = {}
    for row in rows:
        if not isinstance(row, dict):
            continue
        keys = _dedupe_strings(
            [
                row.get("product_id"),
                _lululemon_product_id_from_url(str(row.get("url") or "")),
                _lululemon_product_id_from_url(str(row.get("requested_url") or "")),
                row.get("url"),
                row.get("requested_url"),
            ]
        )
        if not keys:
            continue
        cleaned_variants = []
        for variant in row.get("color_variants") or []:
            if not isinstance(variant, dict):
                continue
            color = str(variant.get("color") or "").strip()
            if not color:
                continue
            cleaned_variants.append(
                {
                    "color": color,
                    "image": str(variant.get("image") or "").strip(),
                    "url": str(
                        variant.get("url")
                        or row.get("url")
                        or row.get("requested_url")
                        or ""
                    ).strip(),
                    "available": bool(variant.get("available")),
                    "sizes": _dedupe_strings(variant.get("sizes") or []),
                }
            )
        detail = {
            "color_variants": cleaned_variants,
            "available_colors": _dedupe_strings(row.get("available_colors") or []),
            "unavailable_colors": _dedupe_strings(row.get("unavailable_colors") or []),
            "material_details": _dedupe_strings(
                row.get("body_materials") or row.get("material_details") or []
            ),
            "innovations": _dedupe_strings(row.get("innovations") or []),
        }
        for key in keys:
            details[key] = detail
    return details


def _apply_lululemon_detail_cache(
    products: list[dict[str, Any]],
    details: dict[str, dict[str, Any]] | None = None,
) -> list[dict[str, Any]]:
    if details is None:
        details = load_lululemon_detail_cache()
    if not details:
        return products

    enriched: list[dict[str, Any]] = []
    for product in products:
        if product.get("brand") != "lululemon":
            enriched.append(product)
            continue
        detail = (
            details.get(str(product.get("product_id") or ""))
            or details.get(str(product.get("source_id") or ""))
            or details.get(str(product.get("url") or ""))
        )
        if not detail:
            enriched.append(product)
            continue

        color_variants = detail.get("color_variants") or []
        available_colors = detail.get("available_colors") or [
            variant["color"] for variant in color_variants if variant.get("available")
        ]
        unavailable_colors = detail.get("unavailable_colors") or [
            variant["color"] for variant in color_variants if not variant.get("available")
        ]
        all_colors = _dedupe_strings(available_colors + unavailable_colors)
        image = product.get("image", "")
        for variant in color_variants:
            if variant.get("image"):
                image = variant["image"]
                break
        material_details = detail.get("material_details") or product.get(
            "material_details", []
        )
        innovations = detail.get("innovations") or product.get("innovations", [])
        style_number = product.get("style_number") or _lululemon_style_number(
            color_variants
        )
        enriched.append(
            {
                **product,
                "style_number": style_number,
                "image": image,
                "color_variants": color_variants or product.get("color_variants", []),
                "available_colors": available_colors,
                "unavailable_colors": unavailable_colors,
                "all_colors": all_colors,
                "color": " / ".join(available_colors or all_colors),
                "available": bool(available_colors) if all_colors else product.get("available", True),
                "variant_count": max(
                    1,
                    len(color_variants) or product.get("variant_count", 1),
                ),
                "material_details": material_details,
                "material": " | ".join(material_details),
                "innovations": innovations,
            }
        )
    return enriched


def _merge_cached_detail_fields(
    products: list[dict[str, Any]],
    cached_products: list[dict[str, Any]],
) -> list[dict[str, Any]]:
    if not cached_products:
        return products

    cached_by_key: dict[str, dict[str, Any]] = {}
    for cached in cached_products:
        for key in _dedupe_strings(
            [
                cached.get("id"),
                cached.get("product_id"),
                cached.get("source_id"),
                cached.get("handle"),
                cached.get("url"),
            ]
        ):
            cached_by_key[key] = cached

    detail_fields = (
        "material",
        "material_details",
        "technical_features",
        "fabric_treatment",
        "construction",
        "innovations",
        "product_functions",
        "season_code",
        "season_year",
        "season_range",
        "season_source",
        "season_notes",
    )
    merged: list[dict[str, Any]] = []
    for product in products:
        cached = None
        for key in _dedupe_strings(
            [
                product.get("id"),
                product.get("product_id"),
                product.get("source_id"),
                product.get("handle"),
                product.get("url"),
            ]
        ):
            cached = cached_by_key.get(key)
            if cached:
                break
        if not cached:
            merged.append(product)
            continue

        enriched = dict(product)
        for field in detail_fields:
            current = enriched.get(field)
            if current not in (None, "", []):
                continue
            cached_value = cached.get(field)
            if cached_value not in (None, "", []):
                enriched[field] = cached_value
        merged.append(enriched)
    return merged


def _normalize_cached_payload(payload: dict[str, Any]) -> dict[str, Any]:
    products = _apply_season_classification(
        _apply_lululemon_detail_cache(
            _clothing_products(
                [
                    _normalize_strauss_categories(product)
                    for product in payload.get("products", [])
                ]
            )
        )
    )
    return {
        **payload,
        "products": products,
        "product_count": len(products),
    }


def _write_payload(path: Path, payload: dict[str, Any]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(
        json.dumps(payload, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )


def _audit_path(scrape_period: dict[str, Any] | None, stamp: str) -> Path:
    return AUDIT_DIR / f"{period_key(scrape_period)}-{stamp}.json"


def _staging_path(scrape_period: dict[str, Any] | None, stamp: str) -> Path:
    return STAGING_DIR / f"{period_key(scrape_period)}-{stamp}.json"


def _brand_archive_period_dir(brand: str, scrape_period: dict[str, Any] | None) -> Path:
    folder_name = BRAND_ARCHIVE_FOLDERS.get(brand, brand.title())
    return BRAND_ARCHIVE_DIR / folder_name / period_key(scrape_period)


def _previous_brand_archive(
    brand: str,
    current_period_key: str,
) -> dict[str, Any] | None:
    folder_name = BRAND_ARCHIVE_FOLDERS.get(brand, brand.title())
    brand_dir = BRAND_ARCHIVE_DIR / folder_name
    if not brand_dir.exists():
        return None
    candidates = [
        path
        for path in brand_dir.iterdir()
        if path.is_dir()
        and path.name < current_period_key
        and (path / "products.json").exists()
    ]
    if not candidates:
        return None
    latest = sorted(candidates, key=lambda path: path.name)[-1] / "products.json"
    try:
        return json.loads(latest.read_text(encoding="utf-8"))
    except (json.JSONDecodeError, OSError):
        return None


def _brand_monthly_change(
    brand: str,
    current_period_key: str,
    products: list[dict[str, Any]],
) -> dict[str, Any]:
    previous_payload = _previous_brand_archive(brand, current_period_key)
    if not previous_payload:
        return {
            "previous_period": None,
            "product_count_change": None,
            "new_product_count": None,
            "removed_product_count": None,
        }

    previous_products = previous_payload.get("products", [])
    previous_ids = {
        product_key(product)
        for product in previous_products
        if product_key(product)
    }
    current_ids = {
        product_key(product)
        for product in products
        if product_key(product)
    }
    return {
        "previous_period": previous_payload.get("period_key"),
        "previous_product_count": len(previous_products),
        "product_count_change": len(products) - len(previous_products),
        "new_product_count": len(current_ids - previous_ids),
        "removed_product_count": len(previous_ids - current_ids),
    }


def write_brand_archives(
    payload: dict[str, Any],
    brand_audits: list[dict[str, Any]],
) -> None:
    scrape_period = payload.get("scrape_period") or None
    current_period_key = period_key(scrape_period)
    audit_by_brand = {audit.get("brand"): audit for audit in brand_audits}
    source_by_brand = {
        source.get("brand"): source
        for source in payload.get("sources", [])
        if source.get("brand")
    }
    brands = sorted(
        {
            product.get("brand")
            for product in payload.get("products", [])
            if product.get("brand")
        }
    )

    for brand in brands:
        products = [
            product
            for product in payload.get("products", [])
            if product.get("brand") == brand
        ]
        products.sort(
            key=lambda item: (
                item.get("title", "").lower(),
                str(item.get("id") or ""),
            )
        )
        source = source_by_brand.get(brand, {})
        summary = summarize_brand(products)
        archive_dir = _brand_archive_period_dir(brand, scrape_period)
        archive_payload = {
            "brand": brand,
            "label": source.get("label") or products[0].get("brand_label") or brand,
            "source_url": source.get("url"),
            "period_key": current_period_key,
            "period_label": period_label(scrape_period) or "Latest",
            "scraped_at": source.get("scraped_at") or payload.get("scraped_at"),
            "product_count": len(products),
            "products": products,
        }
        audit_payload = audit_by_brand.get(brand, {})
        summary_payload = {
            **archive_payload,
            **summary,
            "quality_decision": audit_payload.get("decision"),
            "quality_warnings": audit_payload.get("warnings", []),
            "monthly_change": _brand_monthly_change(
                brand,
                current_period_key,
                products,
            ),
        }

        write_json(archive_dir / "products.json", archive_payload)
        write_json(archive_dir / "summary.json", summary_payload)
        write_json(archive_dir / "audit.json", audit_payload)


def load_period_cache(scrape_period: dict[str, Any] | None) -> dict[str, Any] | None:
    if not scrape_period:
        return load_cache()
    path = period_cache_path(scrape_period)
    if not path.exists():
        return None
    try:
        return _normalize_cached_payload(
            json.loads(path.read_text(encoding="utf-8"))
        )
    except (json.JSONDecodeError, OSError):
        return None


async def scrape_products(scrape_period: dict[str, Any] | None = None) -> dict[str, Any]:
    cached = load_cache() or {}
    cached_products = cached.get("products", [])
    cached_sources = {
        source.get("brand"): source
        for source in cached.get("sources", [])
        if source.get("brand")
    }
    scraped_results = await asyncio.gather(
        scrape_strauss_products(),
        scrape_rhone_products(),
        scrape_arcteryx_products(scrape_period=scrape_period),
        scrape_lululemon_products(),
        scrape_tommy_bahama_products(),
        scrape_travis_mathew_products(),
        return_exceptions=True,
    )
    brand_sources = (
        ("strauss", "Strauss", "https://us.strauss.com"),
        ("rhone", "Rhone", "https://www.rhone.com"),
        ("arcteryx", "Arc'teryx", "https://arcteryx.com/us/en"),
        ("lululemon", "lululemon", "https://shop.lululemon.com"),
        ("tommybahama", "Tommy Bahama", "https://www.tommybahama.com"),
        ("travismathew", "TravisMathew", "https://travismathew.com"),
    )
    results: list[dict[str, Any]] = []
    errors: list[str] = []
    brand_audits: list[dict[str, Any]] = []
    for (brand, label, source_url), result in zip(
        brand_sources, scraped_results
    ):
        if not isinstance(result, Exception):
            brand_cached_products = [
                product
                for product in cached_products
                if product.get("brand") == brand
            ]
            result["products"] = _apply_season_classification(
                _apply_lululemon_detail_cache(
                    _merge_cached_detail_fields(
                        _clothing_products(result.get("products", [])),
                        brand_cached_products,
                    )
                )
            )
            result["product_count"] = len(result["products"])
            audit = validate_brand(
                brand,
                label,
                result["products"],
                brand_cached_products,
            )
            brand_audits.append(audit)
            if audit["decision"] == "fallback" and brand_cached_products:
                fallback_products = _apply_season_classification(
                    _apply_lululemon_detail_cache(
                        _clothing_products(brand_cached_products)
                    )
                )
                fallback_products = _filter_period_products(
                    fallback_products, brand, scrape_period
                )
                result = {
                    "source": source_url,
                    "scraped_at": cached_sources.get(brand, {}).get("scraped_at")
                    or cached.get("scraped_at"),
                    "product_count": len(fallback_products),
                    "products": fallback_products,
                    "collection_options": cached_sources.get(brand, {}).get(
                        "collection_options", []
                    ),
                    "quality_fallback": True,
                }
                errors.append(f"{label} used cached data: {'; '.join(audit['warnings'])}")
            results.append(result)
            continue

        fallback_products = _apply_season_classification(
            _apply_lululemon_detail_cache(
                _clothing_products(
                    [
                        product
                        for product in cached_products
                        if product.get("brand") == brand
                    ]
                )
            )
        )
        fallback_products = _filter_period_products(
            fallback_products, brand, scrape_period
        )
        brand_audits.append(
            validate_brand(
                brand,
                label,
                [],
                fallback_products,
                scrape_error=str(result),
            )
        )
        if not fallback_products:
            errors.append(f"{label}: {result}")
            continue
        cached_source = cached_sources.get(brand, {})
        results.append(
            {
                "source": cached_source.get("url", source_url),
                "scraped_at": cached_source.get("scraped_at")
                or cached.get("scraped_at"),
                "product_count": len(fallback_products),
                "products": fallback_products,
                "collection_options": cached_source.get("collection_options", []),
                "cached_fallback": True,
            }
        )
        errors.append(f"{label} used cached data: {result}")

    if not results:
        raise RuntimeError("; ".join(errors) or "No catalog source returned data")

    products = [
        product
        for result in results
        for product in result.get("products", [])
    ]
    products.sort(
        key=lambda item: (
            item.get("brand_label", "").lower(),
            item.get("title", "").lower(),
        )
    )
    payload = {
        "source": [result["source"] for result in results],
        "sources": [
            {
                "brand": result["products"][0]["brand"],
                "label": result["products"][0]["brand_label"],
                "url": result["source"],
                "product_count": result["product_count"],
                "scraped_at": result["scraped_at"],
                "collection_options": result.get("collection_options", []),
                "period_filter": result.get("period_filter", {}),
            }
            for result in results
            if result.get("products")
        ],
        "scrape_warnings": errors,
        "quality_audit": {
            "status": "published"
            if all(audit["decision"] == "publish" for audit in brand_audits)
            else "published_with_fallback",
            "brands": brand_audits,
        },
        "scraped_at": datetime.now(timezone.utc).isoformat(),
        "scrape_period": scrape_period or {},
        "product_count": len(products),
        "products": products,
    }
    stamp = utc_stamp()
    write_json(_staging_path(scrape_period, stamp), payload)
    backup_file(CACHE_PATH, BACKUP_DIR, stamp)
    _write_payload(CACHE_PATH, payload)
    if scrape_period:
        backup_file(period_cache_path(scrape_period), BACKUP_DIR, stamp)
        _write_payload(period_cache_path(scrape_period), payload)
    write_brand_archives(payload, brand_audits)
    write_json(_audit_path(scrape_period, stamp), build_audit_report(
        scrape_period,
        brand_audits,
        products,
    ))
    return payload


def load_cache() -> dict[str, Any] | None:
    if not CACHE_PATH.exists():
        return None
    try:
        return _normalize_cached_payload(
            json.loads(CACHE_PATH.read_text(encoding="utf-8"))
        )
    except (json.JSONDecodeError, OSError):
        return None


def normalize_csv(value: str | None) -> list[str]:
    if not value:
        return []
    return [part.strip() for part in re.split(r",\s*", value) if part.strip()]
