import json
import shutil
from collections import Counter
from datetime import datetime, timezone
from pathlib import Path
from typing import Any


MAX_DROP_RATIO = 0.15
MAX_MISSING_IMAGE_RATIO = 0.05
MAX_MISSING_COLOR_RATIO = 0.20
MAX_NEW_MISSING_FIELD_RATIO = 0.30


def utc_stamp() -> str:
    return datetime.now(timezone.utc).strftime("%Y%m%d-%H%M%S")


def brand_rows(products: list[dict[str, Any]], brand: str) -> list[dict[str, Any]]:
    return [product for product in products if product.get("brand") == brand]


def product_key(product: dict[str, Any]) -> str:
    return str(
        product.get("id")
        or product.get("product_id")
        or product.get("source_id")
        or product.get("url")
        or product.get("title")
        or ""
    )


def missing_field_count(products: list[dict[str, Any]], field: str) -> int:
    count = 0
    for product in products:
        value = product.get(field)
        if field == "color":
            value = value or product.get("available_colors") or product.get("all_colors")
        if field == "material":
            value = value or product.get("material_details")
        if value in (None, "", []):
            count += 1
    return count


def category_counts(products: list[dict[str, Any]]) -> dict[str, int]:
    counter: Counter[str] = Counter()
    for product in products:
        categories = product.get("categories") or [product.get("category") or "Other"]
        for category in categories:
            counter[str(category)] += 1
    return dict(sorted(counter.items(), key=lambda item: item[0].lower()))


def audience_counts(products: list[dict[str, Any]]) -> dict[str, int]:
    counter: Counter[str] = Counter()
    for product in products:
        for audience in product.get("audiences") or ["unknown"]:
            counter[str(audience)] += 1
    return dict(sorted(counter.items(), key=lambda item: item[0].lower()))


def summarize_brand(products: list[dict[str, Any]]) -> dict[str, Any]:
    total = len(products)
    available = sum(1 for product in products if product.get("available"))
    return {
        "product_count": total,
        "available_count": available,
        "category_counts": category_counts(products),
        "audience_counts": audience_counts(products),
        "missing": {
            "image": missing_field_count(products, "image"),
            "color": missing_field_count(products, "color"),
            "material": missing_field_count(products, "material"),
            "price": sum(
                1
                for product in products
                if product.get("price_known") is False
                or (
                    float(product.get("price_min") or 0) <= 0
                    and float(product.get("price_max") or 0) <= 0
                )
            ),
        },
    }


def validate_brand(
    brand: str,
    label: str,
    new_products: list[dict[str, Any]],
    cached_products: list[dict[str, Any]],
    scrape_error: str | None = None,
) -> dict[str, Any]:
    new_summary = summarize_brand(new_products)
    old_summary = summarize_brand(cached_products)
    new_total = new_summary["product_count"]
    old_total = old_summary["product_count"]
    warnings: list[str] = []
    decision = "publish"

    if scrape_error:
        decision = "fallback"
        warnings.append(f"Scrape error: {scrape_error}")
    elif old_total and new_total < old_total * (1 - MAX_DROP_RATIO):
        decision = "fallback"
        warnings.append(
            f"Product count dropped from {old_total} to {new_total} "
            f"({(old_total - new_total) / old_total:.1%})."
        )

    for field, max_ratio in {
        "image": MAX_MISSING_IMAGE_RATIO,
        "color": MAX_MISSING_COLOR_RATIO,
    }.items():
        missing = new_summary["missing"][field]
        old_missing = old_summary["missing"][field]
        old_ratio = old_missing / old_total if old_total else 0
        new_ratio = missing / new_total if new_total else 0
        worsened_materially = (
            not old_total
            or old_ratio <= max_ratio
            or new_ratio > old_ratio + 0.10
        )
        if new_total and new_ratio > max_ratio and worsened_materially:
            severity = f"{field} missing for {missing}/{new_total} products."
            warnings.append(severity)
            if old_total:
                decision = "fallback"

    for field in ("material", "price"):
        old_missing = old_summary["missing"][field]
        new_missing = new_summary["missing"][field]
        if old_total and new_missing > old_missing + max(10, int(old_total * MAX_NEW_MISSING_FIELD_RATIO)):
            warnings.append(
                f"{field} missing increased from {old_missing} to {new_missing}."
            )

    old_categories = set(old_summary["category_counts"])
    new_categories = set(new_summary["category_counts"])
    disappeared_categories = sorted(old_categories - new_categories)
    if old_total and disappeared_categories:
        warnings.append(
            "Categories disappeared: " + ", ".join(disappeared_categories[:12])
        )

    return {
        "brand": brand,
        "label": label,
        "decision": decision,
        "warnings": warnings,
        "old": old_summary,
        "new": new_summary,
    }


def build_audit_report(
    scrape_period: dict[str, Any] | None,
    brand_audits: list[dict[str, Any]],
    published_products: list[dict[str, Any]],
) -> dict[str, Any]:
    return {
        "created_at": datetime.now(timezone.utc).isoformat(),
        "scrape_period": scrape_period or {},
        "status": "published"
        if all(audit["decision"] == "publish" for audit in brand_audits)
        else "published_with_fallback",
        "published_product_count": len(published_products),
        "brand_audits": brand_audits,
    }


def write_json(path: Path, payload: dict[str, Any]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")


def backup_file(path: Path, backup_dir: Path, stamp: str) -> Path | None:
    if not path.exists():
        return None
    backup_dir.mkdir(parents=True, exist_ok=True)
    target = backup_dir / f"{path.stem}-{stamp}{path.suffix}"
    shutil.copy2(path, target)
    return target
