from django.urls import reverse
from rest_framework.test import APITestCase
from django.contrib.auth.models import User
from product_management.models import Product
from order_management.models import Shipping
from datetime import date
from rest_framework.test import APIClient


class OrderAPITest(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="test", password="pass1234")
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)
        self.ship = Shipping.objects.create(method="Std", fee=5.0, tel="")
        self.prod = Product.objects.create(
            name="Test",
            detail="d",
            price=3.0,
            stock=5,
            production_date=date(2025, 1, 1),
            expiration_date=date(2026, 1, 1),
        )

    def test_add_to_cart_normal(self):
        """[Normal] POST add-to-cart returns 201"""
        url = reverse("add-to-cart")
        resp = self.client.post(
            url, {"product_id": self.prod.id, "quantity": 2}, format="json"
        )
        self.assertEqual(resp.status_code, 201)

    def test_add_to_cart_invalid_input(self):
        """[Invalid Input] non-numeric quantity returns 400"""
        url = reverse("add-to-cart")
        resp = self.client.post(
            url, {"product_id": self.prod.id, "quantity": "abc"}, format="json"
        )
        self.assertEqual(resp.status_code, 400)

    def test_add_to_cart_sql_injection(self):
        """[Attack] injection in quantity returns 400 or 422"""
        url = reverse("add-to-cart")
        resp = self.client.post(
            url, {"product_id": self.prod.id, "quantity": "1;DROP TABLE"}, format="json"
        )
        self.assertIn(resp.status_code, (400, 422))
