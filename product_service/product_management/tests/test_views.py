from django.urls import reverse
from rest_framework.test import APITestCase
from product_management.models import Product
from datetime import date


class ProductAPITest(APITestCase):
    def setUp(self):
        self.prod = Product.objects.create(
            name="Pen",
            detail="Blue ink pen",
            price=1.0,
            stock=5,
            production_date=date(2025, 2, 1),
            expiration_date=date(2026, 2, 1),
        )

    def test_list_products_normal(self):
        """[Normal] GET /api/products/ returns 200"""
        url = reverse("product-list")
        resp = self.client.get(url)
        self.assertEqual(resp.status_code, 200)

    def test_list_products_invalid_method(self):
        """[Invalid Input] POST /api/products/ returns 405"""
        url = reverse("product-list")
        resp = self.client.post(url, {})
        self.assertEqual(resp.status_code, 405)

    def test_detail_sql_injection(self):
        """[Attack] GET /api/products/<injection> returns 400 or 404"""
        url = "/api/product/1 OR 1=1/"
        resp = self.client.get(url)
        self.assertIn(resp.status_code, (400, 404))
