from django.urls import reverse
from rest_framework.test import APITestCase
from django.contrib.auth.models import User
from product_management.models import *
from order_management.models import *
from datetime import date
from rest_framework.test import APIClient


class OrderAPITest(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="testuser", password="pass1234")
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)
        self.shipping = Shipping.objects.create(method="Std", fee=5.0, tel="")
        self.product = Product.objects.create(
            name="TestProduct",
            detail="Test detail",
            price=10.0,
            stock=5,
            production_date=date(2025, 1, 1),
            expiration_date=date(2026, 1, 1),
        )

    def test_add_to_cart_normal(self):
        """[Normal] POST /api/cart/add/ returns 201"""
        url = reverse("add-to-cart")
        resp = self.client.post(
            url, {"product_id": self.product.id, "quantity": 2}, format="json"
        )
        self.assertEqual(resp.status_code, 201)

    def test_add_to_cart_invalid_input(self):
        """[Invalid Input] non-numeric quantity returns 400"""
        url = reverse("add-to-cart")
        resp = self.client.post(
            url, {"product_id": self.product.id, "quantity": "abc"}, format="json"
        )
        self.assertEqual(resp.status_code, 400)

    def test_add_to_cart_sql_injection(self):
        """[Attack] injection in quantity returns 400 or 422"""
        url = reverse("add-to-cart")
        resp = self.client.post(
            url,
            {"product_id": self.product.id, "quantity": "1;DROP TABLE"},
            format="json",
        )
        self.assertIn(resp.status_code, (400, 422))


class UserOrderListViewTest(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="uorders", password="pass")
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)

    def test_user_order_list_normal(self):
        """[Normal] GET /api/order/history/ returns 200"""
        url = reverse("user-orders")
        resp = self.client.get(url)
        self.assertEqual(resp.status_code, 200)


class CartOrderViewTest(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="ucart", password="pass")
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)

    def test_cart_order_view_normal(self):
        """[Normal] GET /api/cart/ returns 200"""
        url = reverse("cart-orders")
        resp = self.client.get(url)
        self.assertEqual(resp.status_code, 200)


class ProductsInUserOrdersViewTest(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="uprod", password="pass")
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)
        self.order = Order.objects.create(customer=self.user, status=Order.STATUS_CART)

    def test_products_in_user_orders_found(self):
        """[Normal] GET /api/orders/{order_id}/products/ returns 200"""
        url = reverse("products-in-orders", args=[self.order.id])
        resp = self.client.get(url)
        self.assertEqual(resp.status_code, 200)

    def test_products_in_user_orders_not_found(self):
        """[Invalid Input] wrong order id returns 404"""
        url = reverse("products-in-orders", args=[9999])
        resp = self.client.get(url)
        self.assertEqual(resp.status_code, 404)


class OrderDetailViewTest(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="odetail", password="pass")
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)
        self.order = Order.objects.create(customer=self.user)

    def test_order_detail_normal(self):
        """[Normal] GET /api/order/{id}/ returns 200"""
        url = reverse("order-detail", args=[self.order.id])
        resp = self.client.get(url)
        self.assertEqual(resp.status_code, 200)

    def test_order_detail_not_found(self):
        """[Invalid Input] wrong id returns 404"""
        url = reverse("order-detail", args=[12345])
        resp = self.client.get(url)
        self.assertEqual(resp.status_code, 404)


class RemoveFromCartViewTest(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="rmcart", password="pass")
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)

    def test_remove_from_cart_not_in_cart(self):
        """[Invalid Input] DELETE /api/cart/remove/{product_id}/ returns 404"""
        url = reverse("remove-from-cart", args=[123])
        resp = self.client.delete(url)
        self.assertEqual(resp.status_code, 404)


class UpdateCartItemViewTest(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="updcart", password="pass")
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)

    def test_update_cart_item_invalid_qty(self):
        """[Invalid Input] PATCH /api/cart/update/{product_id}/ returns 404"""
        url = f"/api/cart/update/123/"
        resp = self.client.patch(url, {"quantity": "abc"}, format="json")
        self.assertEqual(resp.status_code, 404)


class ConfirmOrderViewTest(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="conf", password="pass")
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)
        self.shipping = Shipping.objects.create(method="Std", fee=5.0, tel="")
        self.order = Order.objects.create(customer=self.user, status=Order.STATUS_CART)

    def test_confirm_order_missing_fields(self):
        """[Invalid Input] POST /api/order/confirm/ missing data returns 400"""
        url = reverse("confirm-order")
        resp = self.client.post(url, {}, format="json")
        self.assertEqual(resp.status_code, 400)


class ShippingListViewTest(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="shiplist", password="pass")
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)

    def test_shipping_list_normal(self):
        """[Normal] GET /api/shipping/ returns 200"""
        url = reverse("shipping-list")
        resp = self.client.get(url)
        self.assertEqual(resp.status_code, 200)


class PaymentByOrderViewTest(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="payord", password="pass")
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)

    def test_payment_by_order_not_found(self):
        """[Invalid Input] GET /api/payment/{order_id}/ returns 404"""
        url = reverse("payment-by-order", args=[999])
        resp = self.client.get(url)
        self.assertEqual(resp.status_code, 404)
