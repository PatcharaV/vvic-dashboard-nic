# Auto Scrape Operations

The dashboard should serve saved monthly snapshots only. Do not let dashboard
users start a scrape from the website.

## Recommended Runtime

Run the scraper as a separate scheduled job:

```powershell
python tools/monthly_scrape_snapshot.py
```

The script writes the current monthly snapshot to:

- `backend/data/products.json`
- `backend/data/history/YYYY-MM.json`
- `backend/data/NIC DASHBOARD/<Brand>/<YYYY-MM MMM YYYY>/`
- `frontend/src/snapshotData.json`
- `backend/data/monthly_auto_scrape_status.json`

It also uses `backend/data/monthly_scrape.lock` to prevent overlapping scrape
runs. If a previous run is still active, the next run exits instead of scraping
again.

## Scheduler

Use one scheduler outside the web app, for example:

- Windows Task Scheduler on a dedicated machine
- A cloud VM cron job
- A managed cron service

Schedule it for the monthly maintenance window, for example 08:00 Bangkok time
on the 1st day of every month. Keep the website running from saved snapshots
while the job updates the files.

## Manual/API Scrape Protection

Manual scraping through the API is disabled by default.

To allow a trusted external scheduler to trigger the API, set:

```text
SCRAPE_API_TOKEN=<strong-secret-token>
```

Then call:

```text
POST /api/scrape?month=AUG&year=2026&record_auto_run=true&token=<strong-secret-token>
```

Avoid enabling `ENABLE_MANUAL_SCRAPE=true` in a shared user-facing environment.
That flag is only for local development.
