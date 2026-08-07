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

## Time Limits

Monthly scrape runs are capped so a scheduled task does not run indefinitely.

Default limits:

- `SCRAPE_BRAND_TIMEOUT_SECONDS=780` per brand, about 13 minutes
- `SCRAPE_TOTAL_TIMEOUT_SECONDS=840` for the concurrent brand scrape phase, about 14 minutes
- `SCRAPE_TASK_TIMEOUT_MINUTES=15` for the Windows scheduled task wrapper

If a brand is too slow or rate limited, the scraper falls back to the latest
saved data for that brand. If the whole Python process exceeds the Windows task
limit, the wrapper stops it and removes the stale lock file.

## Scheduler

Use one scheduler outside the web app, for example:

- Windows Task Scheduler on a dedicated machine
- A cloud VM cron job
- A managed cron service

Schedule it for the monthly maintenance window, for example 08:00 Bangkok time
on the 1st day of every month. Keep the website running from saved snapshots
while the job updates the files.

Current Windows task setup:

- Task name: `NIC Dashboard Monthly Auto Scrape`
- Schedule: every month on day `1` at `07:30` Bangkok/local machine time
- Script: `C:\Users\Patchara.V\Desktop\Scraping\scripts\run-monthly-scrape.ps1`
- Next run after setup on 7 Aug 2026: `1 Sep 2026 07:30`
- Multiple instances: `IgnoreNew`
- Task execution limit: `20 minutes`
- Script scrape timeout: `15 minutes`

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
