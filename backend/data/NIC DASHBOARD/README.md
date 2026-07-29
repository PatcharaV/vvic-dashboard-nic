# NIC DASHBOARD Brand Archive

This folder stores monthly product snapshots separated by brand.

Each brand folder contains one folder per scrape period, for example `2026-07`.

Files inside each period:

- `products.json`: product rows for that brand and month.
- `summary.json`: brand counts, missing-field checks, and change versus the previous archived month.
- `audit.json`: scrape quality decision and warnings for that brand.

The main dashboard still reads from `backend/data/products.json` and `backend/data/history`.
This archive is for review, comparison, and monthly tracking.
