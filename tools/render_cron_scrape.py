import json
import os
import sys
from datetime import datetime, timezone
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode
from urllib.request import Request, urlopen


BASE_URL = os.environ.get(
    "DASHBOARD_BASE_URL", "https://vvic-dashboard-nic-rebz.onrender.com"
).rstrip("/")
MONTH = os.environ.get("SCRAPE_MONTH", "AUG").upper()
YEAR = os.environ.get("SCRAPE_YEAR", "2026")
RUN_KEY = os.environ.get("AUTO_SCRAPE_RUN_KEY", f"render-cron-{YEAR}-{MONTH}")
TIMEOUT_SECONDS = int(os.environ.get("SCRAPE_TIMEOUT_SECONDS", "3600"))
SCRAPE_API_TOKEN = os.environ.get("SCRAPE_API_TOKEN", "")


def read_json(request: Request) -> dict:
    with urlopen(request, timeout=TIMEOUT_SECONDS) as response:
        body = response.read().decode("utf-8")
    return json.loads(body)


def main() -> int:
    started_at = datetime.now(timezone.utc).isoformat()
    params = urlencode(
        {
            "month": MONTH,
            "year": YEAR,
            "record_auto_run": "true",
            "run_key": RUN_KEY,
            **({"token": SCRAPE_API_TOKEN} if SCRAPE_API_TOKEN else {}),
        }
    )
    scrape_url = f"{BASE_URL}/api/scrape?{params}"
    print(
        json.dumps(
            {
                "status": "starting",
                "started_at": started_at,
                "url": scrape_url,
                "period": f"{MONTH} {YEAR}",
                "run_key": RUN_KEY,
            },
            indent=2,
        )
    )

    try:
        scrape_result = read_json(Request(scrape_url, method="POST"))
        health = read_json(Request(f"{BASE_URL}/api/health", method="GET"))
    except (HTTPError, URLError, TimeoutError, json.JSONDecodeError) as exc:
        print(json.dumps({"status": "failed", "error": str(exc)}, indent=2))
        return 1

    auto_run = (health.get("auto_scrape_runs") or {}).get(RUN_KEY, {})
    monthly_status = health.get("monthly_auto_scrape") or {}
    completed = scrape_result.get("status") == "completed"
    print(
        json.dumps(
            {
                "status": "completed" if completed else "failed",
                "scrape_result": scrape_result,
                "auto_run": auto_run,
                "monthly_status": monthly_status,
            },
            ensure_ascii=False,
            indent=2,
        )
    )
    return 0 if completed else 1


if __name__ == "__main__":
    raise SystemExit(main())
