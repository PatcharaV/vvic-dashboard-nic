import unittest

from app.catalog import _clothing_products
from app.lskd_scraper import _normalize


class LskdScraperTests(unittest.TestCase):
    def test_normalizes_apparel_product_details(self):
        product = {
            "id": 123,
            "title": "Fusion High-Waisted Legging - Black",
            "handle": "fusion-high-waisted-legging-black",
            "body_html": """
                <ul>
                  <li>Breathable, sweat-wicking four-way stretch fabric</li>
                  <li>71% Recycled Nylon, 29% Elastane</li>
                </ul>
            """,
            "vendor": "LSKD US",
            "product_type": "Womens Leggings",
            "tags": [
                "activityis:Training",
                "fabric:Rep Fabric",
                "range:Fusion",
                "scat:Full Length Leggings",
                "fit:Firm Support",
                "bestsellers",
            ],
            "options": [
                {"name": "Colour", "values": ["Black"]},
                {"name": "Size", "values": ["XS", "S"]},
            ],
            "variants": [
                {
                    "price": "89.00",
                    "available": True,
                    "option1": "Black",
                    "option2": "XS",
                    "image_id": 55,
                },
                {
                    "price": "89.00",
                    "available": False,
                    "option1": "Black",
                    "option2": "S",
                    "image_id": 55,
                },
            ],
            "images": [{"id": 55, "src": "https://cdn.example.com/legging.jpg"}],
            "image": {"id": 55, "src": "https://cdn.example.com/legging.jpg"},
            "published_at": "2026-08-01T00:00:00Z",
            "updated_at": "2026-10-01T00:00:00Z",
        }

        normalized = _normalize(product)

        self.assertIsNotNone(normalized)
        self.assertEqual(normalized["brand"], "lskd")
        self.assertEqual(normalized["category"], "Leggings")
        self.assertEqual(normalized["audiences"], ["women"])
        self.assertIn("Full Length Leggings", normalized["subcategories"])
        self.assertEqual(normalized["collections"], ["Fusion"])
        self.assertEqual(normalized["activities"], ["Training"])
        self.assertEqual(
            normalized["material_details"],
            ["Fabric: Rep Fabric", "71% Recycled Nylon, 29% Elastane"],
        )
        self.assertEqual(
            normalized["innovations"],
            ["Breathable", "Four Way Stretch", "Sweat Wicking"],
        )
        self.assertEqual(normalized["available_colors"], ["Black"])
        self.assertEqual(normalized["price_min"], 89.0)
        self.assertEqual(normalized["image"], "https://cdn.example.com/legging.jpg")
        self.assertTrue(normalized["available"])
        self.assertTrue(normalized["top_seller"])
        clothing = _clothing_products([normalized])
        self.assertEqual(len(clothing), 1)
        self.assertEqual(clothing[0]["brand"], "lskd")

    def test_excludes_non_apparel_products(self):
        product = {
            "id": 456,
            "title": "1% Better Duffle Bag",
            "handle": "one-percent-better-duffle-bag",
            "product_type": "Accessories Bags",
            "tags": [],
            "variants": [],
        }

        self.assertIsNone(_normalize(product))

    def test_unisex_products_cover_men_and_women(self):
        product = {
            "id": 789,
            "title": "FLXCotton Oversize Tee - White",
            "handle": "flxcotton-oversize-tee-white",
            "body_html": "<p>95% Cotton, 5% Spandex</p>",
            "product_type": "Unisex Tees",
            "tags": ["fabric:FLXCotton"],
            "options": [],
            "variants": [{"price": "54.00", "available": True}],
            "images": [],
        }

        normalized = _normalize(product)

        self.assertEqual(normalized["audiences"], ["men", "women"])
        self.assertEqual(normalized["audience_labels"], ["Men", "Women"])


if __name__ == "__main__":
    unittest.main()
