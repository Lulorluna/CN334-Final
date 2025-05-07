from django.test import TestCase
from django.contrib.auth.models import User
from order_management.models import Shipping, Order, ProductOrder, Payment
from product_management.models import Product
from datetime import date
from django.core.exceptions import ValidationError


class ShippingModelTest(TestCase):
    def setUp(self):
        self.ship = Shipping.objects.create(method="Fast", fee=10.0, tel="0812345678")

    def test_str(self):
        """Shipping __str__ returns method"""
        self.assertEqual(str(self.ship), "Fast")


class OrderModelsTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="u1", password="pass")
        self.ship = Shipping.objects.create(method="Std", fee=5.0)
        self.order = Order.objects.create(customer=self.user, shipping=self.ship)

    def test_create_order_normal(self):
        """[Normal] Order is created with default values"""
        self.assertEqual(self.order.status, Order.STATUS_PENDING)
        self.assertEqual(self.order.total_price, 0)

    def test_invalid_status(self):
        """[Invalid Input] setting invalid status raises ValidationError"""
        with self.assertRaises(ValidationError):
            self.order.status = "invalid"
            self.order.full_clean()

    def test_xss_in_status(self):
        """[Attack] XSS string in status is sanitized"""
        bad = "<script>alert(1)</script>"
        self.order.status = bad
        self.order.save()
        self.order.refresh_from_db()
        self.assertNotEqual(self.order.status, bad)


class ProductOrderModelsTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="u2", password="pass")
        self.order = Order.objects.create(customer=self.user)
        self.prod = Product.objects.create(
            name="P2",
            detail="d2",
            price=5.0,
            stock=2,
            production_date=date(2025, 1, 1),
            expiration_date=date(2026, 1, 1),
        )

    def test_total_price_property(self):
        """ProductOrder.total_price returns product.price * quantity"""
        po = ProductOrder(order=self.order, product=self.prod, quantity=2)
        self.assertEqual(po.total_price, 10.0)

    def test_exceed_stock_raises(self):
        """[Invalid Input] saving more than stock raises ValueError"""
        self.order.status = Order.STATUS_CART
        self.order.save()
        with self.assertRaises(ValueError):
            ProductOrder(order=self.order, product=self.prod, quantity=3).save()


class PaymentModelsTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="u3", password="pass")
        self.order = Order.objects.create(customer=self.user)
        self.ship = Shipping.objects.create(method="Fast", fee=7.5, tel="")

    def test_amount_calculation(self):
        """[Normal] Payment.amount is total_price + shipping fee"""
        self.order.shipping = self.ship
        self.order.total_price = 20.0
        self.order.save()
        pay = Payment(order=self.order)
        pay.save()
        self.assertEqual(pay.amount, 27.5)
