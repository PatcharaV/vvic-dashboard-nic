import asyncio
import unittest
from datetime import datetime

from zoneinfo import ZoneInfo

from app import main


class RuntimeSafetyTests(unittest.TestCase):
    def setUp(self):
        self.original_store = dict(main.store)
        self.original_load_cache = main.load_cache
        self.original_load_latest_period_cache = main.load_latest_period_cache
        self.original_load_period_cache = main.load_period_cache
        self.original_scrape_products = main.scrape_products
        main.store.clear()

    def tearDown(self):
        main.store.clear()
        main.store.update(self.original_store)
        main.load_cache = self.original_load_cache
        main.load_latest_period_cache = self.original_load_latest_period_cache
        main.load_period_cache = self.original_load_period_cache
        main.scrape_products = self.original_scrape_products

    def test_get_data_uses_latest_snapshot_without_scraping(self):
        latest = {
            "products": [],
            "source": [],
            "scraped_at": "cached",
            "scrape_period": {"month": "JUL", "year": 2026, "label": "JUL 2026"},
        }
        main.load_cache = lambda: None
        main.load_latest_period_cache = lambda: latest

        async def fail_scrape(*_args, **_kwargs):
            raise AssertionError("get_data should not scrape without force=True")

        main.scrape_products = fail_scrape

        data = asyncio.run(main.get_data())

        self.assertIs(data, latest)
        self.assertIs(main.store["data"], latest)

    def test_missing_selected_period_falls_back_to_latest_snapshot(self):
        latest = {
            "products": [],
            "source": [],
            "scraped_at": "cached",
            "scrape_period": {"month": "JUL", "year": 2026, "label": "JUL 2026"},
        }
        main.load_period_cache = lambda _period: None
        main.load_latest_period_cache = lambda: latest

        data = asyncio.run(
            main.get_data(
                scrape_period={"month": "AUG", "year": 2026, "label": "AUG 2026"}
            )
        )

        self.assertIs(data, latest)
        self.assertIs(main.store["data:AUG 2026"], latest)

    def test_preload_latest_snapshot_stores_period_key(self):
        latest = {
            "products": [],
            "source": [],
            "scraped_at": "cached",
            "scrape_period": {"month": "JUL", "year": 2026, "label": "JUL 2026"},
        }
        main.load_cache = lambda: None
        main.load_latest_period_cache = lambda: latest

        main.preload_latest_snapshot()

        self.assertIs(main.store["data"], latest)
        self.assertIs(main.store["data:JUL 2026"], latest)

    def test_monthly_maintenance_window_ends_at_0830_bangkok(self):
        tz = ZoneInfo("Asia/Bangkok")

        active = main.maintenance_window(datetime(2026, 8, 1, 8, 29, tzinfo=tz))
        ended = main.maintenance_window(datetime(2026, 8, 1, 8, 30, tzinfo=tz))

        self.assertTrue(active["scheduled"])
        self.assertTrue(active["active"])
        self.assertFalse(ended["scheduled"])
        self.assertFalse(ended["active"])
        self.assertIn("08:30", ended["message"])
