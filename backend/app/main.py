import asyncio
import json
from contextlib import asynccontextmanager
from datetime import datetime, time, timezone
from pathlib import Path
from typing import Any
from zoneinfo import ZoneInfo

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from .analytics import build_dashboard, build_options, filter_products
from .catalog import (
    AUDIT_DIR,
    CACHE_PATH,
    HISTORY_START_MONTH,
    HISTORY_START_YEAR,
    available_periods,
    load_cache,
    load_latest_period_cache,
    load_period_cache,
    normalize_csv,
    scrape_products,
)

MONTH_LABELS = {
    "JAN": "January",
    "FEB": "February",
    "MAR": "March",
    "APR": "April",
    "MAY": "May",
    "JUN": "June",
    "JUL": "July",
    "AUG": "August",
    "SEP": "September",
    "OCT": "October",
    "NOV": "November",
    "DEC": "December",
}

store: dict[str, Any] = {}
scrape_lock = asyncio.Lock()
auto_scrape_task: asyncio.Task | None = None
monthly_scrape_task: asyncio.Task | None = None
LOCAL_TZ = ZoneInfo("Asia/Bangkok")
AUTO_SCRAPE_RUNS_PATH = CACHE_PATH.parent / "auto_scrape_runs.json"
MONTHLY_AUTO_STATUS_PATH = CACHE_PATH.parent / "monthly_auto_scrape_status.json"
MAINTENANCE_START = time(8, 0)
MAINTENANCE_END = time(8, 30)
ONE_TIME_AUTO_SCRAPES: list[dict[str, Any]] = []


def make_scrape_period(month: str | None, year: int | None) -> dict[str, Any] | None:
    if not month or not year:
        return None
    month = month.upper()
    return {
        "month": month,
        "month_label": MONTH_LABELS[month],
        "year": year,
        "label": f"{month} {year}",
    }


def current_scrape_period() -> dict[str, Any]:
    now = datetime.now(LOCAL_TZ)
    month = list(MONTH_LABELS)[now.month - 1]
    year = now.year
    if year < HISTORY_START_YEAR or (
        year == HISTORY_START_YEAR and now.month < HISTORY_START_MONTH
    ):
        month = "JUN"
        year = 2026
    return make_scrape_period(month, year) or {
        "month": "JUN",
        "month_label": "June",
        "year": 2026,
        "label": "JUN 2026",
    }


def load_auto_scrape_runs() -> dict[str, Any]:
    if not AUTO_SCRAPE_RUNS_PATH.exists():
        return {}
    try:
        return json.loads(AUTO_SCRAPE_RUNS_PATH.read_text(encoding="utf-8"))
    except (json.JSONDecodeError, OSError):
        return {}


def save_auto_scrape_run(key: str, payload: dict[str, Any]) -> None:
    runs = load_auto_scrape_runs()
    runs[key] = payload
    AUTO_SCRAPE_RUNS_PATH.parent.mkdir(parents=True, exist_ok=True)
    AUTO_SCRAPE_RUNS_PATH.write_text(
        json.dumps(runs, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )


def monthly_scrape_key(period: dict[str, Any]) -> str:
    return f"monthly-{period['year']}-{period['month']}"


def load_monthly_auto_status() -> dict[str, Any]:
    if not MONTHLY_AUTO_STATUS_PATH.exists():
        return {}
    try:
        return json.loads(MONTHLY_AUTO_STATUS_PATH.read_text(encoding="utf-8"))
    except (json.JSONDecodeError, OSError):
        return {}


def save_monthly_auto_status(payload: dict[str, Any]) -> None:
    MONTHLY_AUTO_STATUS_PATH.parent.mkdir(parents=True, exist_ok=True)
    MONTHLY_AUTO_STATUS_PATH.write_text(
        json.dumps(payload, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )


def consume_task_exception(task: asyncio.Task) -> None:
    try:
        task.exception()
    except asyncio.CancelledError:
        pass


def maintenance_window(now: datetime | None = None) -> dict[str, Any]:
    now = now or datetime.now(LOCAL_TZ)
    start = datetime.combine(now.date(), MAINTENANCE_START, tzinfo=LOCAL_TZ)
    end = datetime.combine(now.date(), MAINTENANCE_END, tzinfo=LOCAL_TZ)
    scheduled = now.day == 1 and start <= now < end
    status = load_monthly_auto_status()
    running = status.get("status") == "running"
    active = scheduled or running
    return {
        "active": active,
        "scheduled": scheduled,
        "running": running,
        "message": "Monthly catalog update in progress. The dashboard will reopen after 08:30 Bangkok time.",
        "starts_at": start.isoformat(),
        "ends_at": end.isoformat(),
        "timezone": "Asia/Bangkok",
        "latest_run": status,
    }


def latest_audit_report() -> dict[str, Any] | None:
    if not AUDIT_DIR.exists():
        return None
    reports = sorted(AUDIT_DIR.glob("*.json"), key=lambda path: path.stat().st_mtime)
    if not reports:
        return None
    try:
        return json.loads(reports[-1].read_text(encoding="utf-8"))
    except (json.JSONDecodeError, OSError):
        return None


async def run_monthly_auto_scrape(triggered_by: str = "scheduler") -> dict[str, Any]:
    period = current_scrape_period()
    key = monthly_scrape_key(period)
    latest = load_monthly_auto_status()
    if latest.get("key") == key and latest.get("status") == "completed":
        return latest

    started_at = datetime.now(timezone.utc).isoformat()
    save_monthly_auto_status(
        {
            "key": key,
            "status": "running",
            "triggered_by": triggered_by,
            "started_at": started_at,
            "scrape_period": period,
        }
    )
    try:
        data = await get_data(force=True, scrape_period=period)
    except Exception as exc:
        status = {
            "key": key,
            "status": "failed",
            "triggered_by": triggered_by,
            "started_at": started_at,
            "completed_at": datetime.now(timezone.utc).isoformat(),
            "scrape_period": period,
            "error": str(exc),
        }
        save_monthly_auto_status(status)
        raise

    status = {
        "key": key,
        "status": "completed",
        "triggered_by": triggered_by,
        "started_at": started_at,
        "completed_at": datetime.now(timezone.utc).isoformat(),
        "scrape_period": data.get("scrape_period", period),
        "product_count": data.get("product_count"),
        "quality_status": data.get("quality_audit", {}).get("status"),
        "warnings": data.get("scrape_warnings", []),
    }
    save_monthly_auto_status(status)
    return status


def start_monthly_auto_scrape(triggered_by: str = "scheduler") -> dict[str, Any]:
    global monthly_scrape_task
    period = current_scrape_period()
    latest = load_monthly_auto_status()
    if latest.get("key") == monthly_scrape_key(period) and latest.get("status") == "completed":
        return {"status": "already_completed", "latest_run": latest}
    if monthly_scrape_task and not monthly_scrape_task.done():
        return {"status": "already_running", "latest_run": latest}
    monthly_scrape_task = asyncio.create_task(run_monthly_auto_scrape(triggered_by))
    monthly_scrape_task.add_done_callback(consume_task_exception)
    return {
        "status": "started",
        "scrape_period": period,
        "latest_run": load_monthly_auto_status(),
    }


async def run_due_one_time_auto_scrapes(now: datetime) -> None:
    completed = load_auto_scrape_runs()
    for schedule in ONE_TIME_AUTO_SCRAPES:
        key = schedule["key"]
        if key in completed or now < schedule["run_at"]:
            continue
        period_config = schedule["period"]
        period = make_scrape_period(period_config["month"], period_config["year"])
        try:
            data = await get_data(force=True, scrape_period=period)
        except Exception as exc:
            save_auto_scrape_run(
                key,
                {
                    "status": "failed",
                    "description": schedule["description"],
                    "scheduled_for": schedule["run_at"].isoformat(),
                    "completed_at": datetime.now(timezone.utc).isoformat(),
                    "scrape_period": period,
                    "error": str(exc),
                },
            )
            continue
        save_auto_scrape_run(
            key,
            {
                "status": "completed",
                "description": schedule["description"],
                "scheduled_for": schedule["run_at"].isoformat(),
                "completed_at": datetime.now(timezone.utc).isoformat(),
                "scrape_period": data.get("scrape_period", period),
                "product_count": data.get("product_count"),
            },
        )


async def get_data(
    force: bool = False, scrape_period: dict[str, Any] | None = None
) -> dict[str, Any]:
    cache_key = f"data:{scrape_period.get('label')}" if scrape_period else "data"
    if not force and cache_key in store:
        return store[cache_key]

    async with scrape_lock:
        if force:
            store[cache_key] = await scrape_products(scrape_period=scrape_period)
            if not scrape_period:
                store["data"] = store[cache_key]
        elif cache_key not in store:
            if scrape_period:
                cached = load_period_cache(scrape_period)
                if not cached:
                    cached = load_latest_period_cache()
                    if not cached:
                        raise HTTPException(
                            status_code=404,
                            detail=(
                                f"No cached snapshot for {scrape_period['label']} "
                                "or any previous period. Run scrape once first."
                            ),
                        )
                store[cache_key] = cached
            else:
                cached = load_cache() or load_latest_period_cache()
                if not cached:
                    raise HTTPException(
                        status_code=404,
                        detail="No cached catalog snapshot available. Run scrape once first.",
                    )
                store[cache_key] = cached
    return store[cache_key]


async def monthly_auto_scrape_loop() -> None:
    while True:
        now = datetime.now(LOCAL_TZ)
        try:
            await run_due_one_time_auto_scrapes(now)
            if maintenance_window(now)["scheduled"]:
                start_monthly_auto_scrape("server-loop")
        except Exception:
            pass
        await asyncio.sleep(60)


@asynccontextmanager
async def lifespan(_: FastAPI):
    global auto_scrape_task
    auto_scrape_task = asyncio.create_task(monthly_auto_scrape_loop())
    try:
        yield
    finally:
        if auto_scrape_task:
            auto_scrape_task.cancel()


app = FastAPI(
    title="Strauss Product Dashboard API",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
async def health() -> dict[str, Any]:
    return {
        "status": "ok",
        "cache_available": CACHE_PATH.exists(),
        "data_loaded": "data" in store,
        "available_periods": available_periods(),
        "auto_scrape_runs": load_auto_scrape_runs(),
        "monthly_auto_scrape": load_monthly_auto_status(),
        "maintenance": maintenance_window(),
        "latest_audit": latest_audit_report(),
    }


@app.get("/api/maintenance")
async def maintenance() -> dict[str, Any]:
    return maintenance_window()


@app.post("/api/auto-scrape/monthly")
async def auto_scrape_monthly() -> dict[str, Any]:
    return start_monthly_auto_scrape("external-scheduler")


@app.get("/api/auto-scrape/monthly/status")
async def auto_scrape_monthly_status() -> dict[str, Any]:
    return {
        "maintenance": maintenance_window(),
        "latest_run": load_monthly_auto_status(),
    }


@app.get("/api/audits/latest")
async def latest_audit() -> dict[str, Any]:
    report = latest_audit_report()
    if not report:
        raise HTTPException(status_code=404, detail="No audit report available")
    return report


@app.get("/api/periods")
async def periods() -> dict[str, Any]:
    return {
        "start": {"month": "JUN", "year": 2026, "label": "JUN 2026"},
        "current": current_scrape_period(),
        "available": available_periods(),
    }


@app.get("/api/options")
async def options(
    month: str | None = Query(default=None, pattern="^(JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC)$"),
    year: int | None = Query(default=None, ge=2026, le=2100),
    search: str | None = None,
    brands: str | None = None,
    audiences: str | None = None,
    collections: str | None = None,
    activities: str | None = None,
    features: str | None = None,
    categories: str | None = None,
    subcategories: str | None = None,
    color: str | None = None,
    min_price: float | None = Query(default=None, ge=0),
    max_price: float | None = Query(default=None, ge=0),
    availability: str | None = Query(default=None, pattern="^(available|unavailable)$"),
    top_seller: str | None = Query(default=None, pattern="^(yes|no)$"),
    shop_highlight: str | None = None,
    material: str | None = None,
    season: str | None = None,
) -> dict[str, Any]:
    if min_price is not None and max_price is not None and min_price > max_price:
        raise HTTPException(status_code=400, detail="min_price must not exceed max_price")

    scrape_period = make_scrape_period(month, year)
    data = await get_data(scrape_period=scrape_period)
    selected_categories = normalize_csv(categories)
    selected_brand_values = normalize_csv(brands)
    products = filter_products(
        data["products"],
        search,
        brands=selected_brand_values,
        audiences=normalize_csv(audiences),
        collections=normalize_csv(collections),
        activities=normalize_csv(activities),
        features=normalize_csv(features),
        categories=selected_categories,
        subcategories=normalize_csv(subcategories),
        color=color,
        min_price=min_price,
        max_price=max_price,
        availability=availability,
        top_seller=top_seller,
        shop_highlight=shop_highlight,
        material=material,
        season=season,
    )
    options = build_options(products, selected_categories)
    options["brands"] = build_options(data["products"])["brands"]
    selected_brands = set(selected_brand_values)
    extra_collections = {
        collection
        for source in data.get("sources", [])
        if not selected_brands or source.get("brand") in selected_brands
        for collection in source.get("collection_options", [])
    }
    if extra_collections:
        options["collections"] = sorted(
            set(options.get("collections", [])) | extra_collections,
            key=str.lower,
        )
    return options


@app.get("/api/dashboard")
async def dashboard(
    month: str | None = Query(default=None, pattern="^(JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC)$"),
    year: int | None = Query(default=None, ge=2026, le=2100),
    search: str | None = None,
    brands: str | None = None,
    audiences: str | None = None,
    collections: str | None = None,
    activities: str | None = None,
    features: str | None = None,
    categories: str | None = None,
    subcategories: str | None = None,
    color: str | None = None,
    min_price: float | None = Query(default=None, ge=0),
    max_price: float | None = Query(default=None, ge=0),
    availability: str | None = Query(default=None, pattern="^(available|unavailable)$"),
    top_seller: str | None = Query(default=None, pattern="^(yes|no)$"),
    shop_highlight: str | None = None,
    material: str | None = None,
    season: str | None = None,
) -> dict[str, Any]:
    if min_price is not None and max_price is not None and min_price > max_price:
        raise HTTPException(status_code=400, detail="min_price must not exceed max_price")

    scrape_period = make_scrape_period(month, year)
    data = await get_data(scrape_period=scrape_period)
    selected_categories = normalize_csv(categories)
    selected_brand_values = normalize_csv(brands)
    products = filter_products(
        data["products"],
        search=search,
        brands=selected_brand_values,
        audiences=normalize_csv(audiences),
        collections=normalize_csv(collections),
        activities=normalize_csv(activities),
        features=normalize_csv(features),
        categories=selected_categories,
        subcategories=normalize_csv(subcategories),
        color=color,
        min_price=min_price,
        max_price=max_price,
        availability=availability,
        top_seller=top_seller,
        shop_highlight=shop_highlight,
        material=material,
        season=season,
    )
    return build_dashboard(
        products,
        data["source"],
        data.get("scraped_at"),
        data.get("scrape_period"),
        selected_categories,
    )


@app.get("/api/products")
async def products(
    month: str | None = Query(default=None, pattern="^(JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC)$"),
    year: int | None = Query(default=None, ge=2026, le=2100),
    search: str | None = None,
    brands: str | None = None,
    audiences: str | None = None,
    collections: str | None = None,
    activities: str | None = None,
    features: str | None = None,
    categories: str | None = None,
    subcategories: str | None = None,
    color: str | None = None,
    min_price: float | None = Query(default=None, ge=0),
    max_price: float | None = Query(default=None, ge=0),
    availability: str | None = Query(default=None, pattern="^(available|unavailable)$"),
    top_seller: str | None = Query(default=None, pattern="^(yes|no)$"),
    shop_highlight: str | None = None,
    material: str | None = None,
    season: str | None = None,
    limit: int = Query(default=100, ge=1, le=500),
) -> dict[str, Any]:
    scrape_period = make_scrape_period(month, year)
    data = await get_data(scrape_period=scrape_period)
    selected_brand_values = normalize_csv(brands)
    rows = filter_products(
        data["products"],
        search=search,
        brands=selected_brand_values,
        audiences=normalize_csv(audiences),
        collections=normalize_csv(collections),
        activities=normalize_csv(activities),
        features=normalize_csv(features),
        categories=normalize_csv(categories),
        subcategories=normalize_csv(subcategories),
        color=color,
        min_price=min_price,
        max_price=max_price,
        availability=availability,
        top_seller=top_seller,
        shop_highlight=shop_highlight,
        material=material,
        season=season,
    )
    return {"total": len(rows), "products": rows[:limit]}


@app.post("/api/scrape")
async def scrape(
    month: str = Query(default="JAN", pattern="^(JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC)$"),
    year: int = Query(default=2026, ge=2020, le=2100),
) -> dict[str, Any]:
    scrape_period = {
        "month": month,
        "month_label": MONTH_LABELS[month],
        "year": year,
        "label": f"{month} {year}",
    }
    try:
        data = await get_data(force=True, scrape_period=scrape_period)
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"Scraping failed: {exc}") from exc
    return {
        "status": "completed",
        "product_count": data["product_count"],
        "scraped_at": data["scraped_at"],
        "scrape_period": data.get("scrape_period", scrape_period),
    }


FRONTEND_DIST = Path(__file__).resolve().parents[2] / "frontend" / "dist"
if FRONTEND_DIST.exists():
    app.mount(
        "/assets",
        StaticFiles(directory=FRONTEND_DIST / "assets"),
        name="assets",
    )
    for static_name in (
        "strauss-pitch-slides",
        "arcteryx-cotton-slides",
    ):
        static_dir = FRONTEND_DIST / static_name
        if static_dir.exists():
            app.mount(
                f"/{static_name}",
                StaticFiles(directory=static_dir),
                name=static_name,
            )

    @app.get("/{full_path:path}")
    async def frontend_app(full_path: str) -> FileResponse:
        requested = FRONTEND_DIST / full_path
        if requested.exists() and requested.is_file():
            return FileResponse(requested)
        return FileResponse(FRONTEND_DIST / "index.html")
