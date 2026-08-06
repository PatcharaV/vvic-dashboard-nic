import asyncio
import unittest
from datetime import datetime

from zoneinfo import ZoneInfo

from app import main
from app.catalog import _clothing_products
from app.tommy_bahama_scraper import (
    _candidate_url,
    _color_variants_from_feed,
    _detail_bullets,
    _feed_color,
    _material_bullets,
)


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

    def test_tommy_bahama_cached_products_get_detail_enrichment(self):
        products = _clothing_products(
            [
                {
                    "id": "tommybahama:test",
                    "brand": "tommybahama",
                    "brand_label": "Tommy Bahama",
                    "title": "Abby Eyelet Half Zip IslandZone Dress",
                    "category": "Dresses",
                    "categories": ["Dresses"],
                    "collections": ["IslandZone"],
                    "description": "",
                    "tags": [],
                    "material": "",
                    "material_details": [],
                }
            ]
        )

        self.assertIn("Polyester performance fabric", products[0]["material_details"])
        self.assertIn("Breathable / cooling comfort", products[0]["innovations"])

    def test_tommy_bahama_material_and_care_bullets_are_split(self):
        detail = {
            "productBullets": {
                "productBullet1": "Body: 100% silk.<br>Decoration: 100% rayon.",
                "productBullet2": "Dry clean only.",
                "productBullet3": "Traditional camp collar.",
            }
        }

        bullets = _detail_bullets(detail)
        materials = _material_bullets(bullets)

        self.assertEqual(materials, ["Body: 100% silk. | Decoration: 100% rayon"])

    def test_tommy_bahama_candidate_url_matches_whole_terms(self):
        self.assertFalse(
            _candidate_url(
                "https://www.tommybahama.com/en/Glow-Harvest-Moon-Light/p/31970-033"
            )
        )
        self.assertTrue(
            _candidate_url(
                "https://www.tommybahama.com/en/Highland-Rocker-Leather-Jacket/p/ST524711-262"
            )
        )

    def test_tommy_bahama_leather_material_is_captured(self):
        materials = _material_bullets(["100% lamb leather.", "Professional leather clean only."])

        self.assertEqual(materials, ["100% lamb leather"])

    def test_tommy_bahama_feed_color_names_are_used(self):
        feed = [
            {
                "productCode": "SW622679-5893",
                "colorName": "Very Berry",
                "scene7Url": "https://tommybahama.scene7.com/is/image/TommyBahama/SW622679_5893_main",
                "sizes": [{"availability": 3}],
            },
            {
                "productCode": "SW622679-033",
                "colorName": "White",
                "scene7Url": "https://tommybahama.scene7.com/is/image/TommyBahama/SW622679_033_main",
                "sizes": [{"availability": 0}],
            },
        ]

        self.assertEqual(_feed_color(feed, "SW622679-033", "033"), "White")
        self.assertEqual(
            _color_variants_from_feed(feed),
            [
                {
                    "color": "Very Berry",
                    "image": "https://tommybahama.scene7.com/is/image/TommyBahama/SW622679_5893_main?$v26_pdp_alt_desktop$",
                    "url": "https://www.tommybahama.com/p/SW622679-5893",
                    "available": True,
                },
                {
                    "color": "White",
                    "image": "https://tommybahama.scene7.com/is/image/TommyBahama/SW622679_033_main?$v26_pdp_alt_desktop$",
                    "url": "https://www.tommybahama.com/p/SW622679-033",
                    "available": False,
                },
            ],
        )

    def test_travismathew_cached_products_get_detail_enrichment(self):
        products = _clothing_products(
            [
                {
                    "id": "travismathew:test",
                    "brand": "travismathew",
                    "brand_label": "TravisMathew",
                    "title": "AB Energy Polo",
                    "category": "Polos",
                    "categories": ["Polos"],
                    "collections": [],
                    "description": "Our exclusive Tour Guide fabric stays cool when the pace picks up.",
                    "tags": [],
                    "material": "",
                    "material_details": [],
                }
            ]
        )

        self.assertIn("Tour Guide performance fabric", products[0]["material_details"])
        self.assertIn("Golf performance fabric", products[0]["innovations"])
