from django.test import TestCase
from product_management.models import Category, Product
from datetime import date


class CategoryModelTest(TestCase):
    def setUp(self):
        Category.objects.create(name="Electronics")

    def test_str(self):
        """Category __str__ returns name"""
        cat = Category.objects.get(name="Electronics")
        self.assertEqual(str(cat), "Electronics")


class ProductModelTest(TestCase):
    def setUp(self):
        self.prod = Product.objects.create(
            name="Notebook",
            detail="A lined notebook",
            price=2.5,
            stock=10,
            production_date=date(2025, 1, 1),
            expiration_date=date(2026, 1, 1),
        )

    def test_available_when_stock_positive(self):
        """Product.available is True when stock > 0"""
        self.assertTrue(self.prod.available)

    def test_unavailable_when_stock_zero(self):
        """Product.available is False when stock = 0"""
        self.prod.stock = 0
        self.prod.save()
        self.assertFalse(self.prod.available)
