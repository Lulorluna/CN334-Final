from rest_framework.test import APITestCase, APIClient
from django.urls import reverse
from django.contrib.auth.models import User
from user_management.models import Customer, Address, UserPaymentMethod


class CustomerViewTest(APITestCase):
    def setUp(self):
        # สร้าง user + customer profile
        self.user = User.objects.create_user(username="cv", password="pass")
        Customer.objects.create(
            user=self.user,
            fullname="N",
            date_of_birth="2000-01-01",
            sex="M",
            tel="08123",
        )
        # บังคับให้ client ใช้สิทธิ์ user นี้
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)

    def test_get_myinfo_normal(self):
        """[Normal] GET /api/myinfo returns 200"""
        resp = self.client.get(reverse("myinfo"))
        self.assertEqual(resp.status_code, 200)

    def test_put_myinfo_invalid(self):
        """[Invalid Input] PUT /api/myinfo with empty fullname returns 400"""
        resp = self.client.put(reverse("myinfo"), {"fullname": ""}, format="json")
        self.assertEqual(resp.status_code, 400)

    def test_put_myinfo_xss_attack(self):
        """[Attack] PUT /api/myinfo with XSS in fullname should be sanitized or rejected"""
        xss_payload = "<script>alert('XSS')</script>"
        resp = self.client.put(
            reverse("myinfo"), {"fullname": xss_payload}, format="json"
        )
        self.assertIn(resp.status_code, [400, 422])
        if resp.status_code == 200:
            self.assertNotIn("<script>", resp.json().get("fullname", ""))


class AddressAPITest(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="a1", password="pass")
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)

    def test_list_address_normal(self):
        """[Normal] GET /api/addresses/ returns 200"""
        resp = self.client.get(reverse("address-list"))
        self.assertEqual(resp.status_code, 200)

    def test_create_address_invalid(self):
        """[Invalid Input] POST /api/addresses/ with empty data returns 400"""
        resp = self.client.post(reverse("address-list"), {}, format="json")
        self.assertEqual(resp.status_code, 400)


class PaymentMethodAPITest(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="pm", password="pass")
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)

    def test_list_payment_methods_normal(self):
        """[Normal] GET /api/payment/ returns 200"""
        resp = self.client.get(reverse("paymentmethod-list"))
        self.assertEqual(resp.status_code, 200)

    def test_create_payment_method_invalid(self):
        """[Invalid Input] POST /api/payment/ with empty data returns 400"""
        resp = self.client.post(reverse("paymentmethod-list"), {}, format="json")
        self.assertEqual(resp.status_code, 400)


class RegisterViewTest(APITestCase):
    def test_register_normal(self):
        """[Normal] POST /api/register returns 201"""
        payload = {
            "username": "testuser",
            "password": "password123",
            "email": "test@example.com",
            "fullname": "Test User",
            "date_of_birth": "2000-01-01",
            "sex": "Male",
            "tel": "0812345678",
        }
        resp = self.client.post(reverse("register"), payload, format="json")
        self.assertEqual(resp.status_code, 201)

    def test_register_invalid(self):
        """[Invalid Input] POST /api/register with missing fields returns 400"""
        payload = {
            "username": "",
            "password": "short",
        }
        resp = self.client.post(reverse("register"), payload, format="json")
        self.assertEqual(resp.status_code, 400)

    def test_register_sql_injection(self):
        """[Attack] SQL injection in username returns 400 or 422"""
        payload = {
            "username": "admin' OR '1'='1",
            "password": "hack1234",
            "email": "attacker@example.com",
            "fullname": "Attacker",
            "date_of_birth": "2000-01-01",
            "sex": "M",
            "tel": "0999999999",
        }
        resp = self.client.post(reverse("register"), payload, format="json")
        self.assertIn(resp.status_code, [400, 422])
