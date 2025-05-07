from django.test import TestCase
from django.contrib.auth.models import User
from user_management.models import *
from django.core.exceptions import ValidationError


class CustomerModelTest(TestCase):
    def setUp(self):
        User.objects.create_user(username="C1", password="pass")

    def test_create_customer_normal(self):
        """[Normal] Customer created correctly"""
        user = User.objects.get(username="C1")
        cust = Customer(
            user=user, fullname="Name", date_of_birth="2000-01-01", sex="M", tel="08123"
        )
        cust.save()
        self.assertEqual(str(cust), "C1")

    def test_invalid_tel(self):
        """[Invalid Input] non-numeric tel raises ValidationError"""
        with self.assertRaises(ValidationError):
            cust = Customer(
                user=User.objects.get(username="C1"),
                fullname="N",
                date_of_birth="2000-01-01",
                sex="M",
                tel="abc",
            )
            cust.full_clean()

    def test_xss_fullname(self):
        """[Attack] XSS in fullname sanitized"""
        user = User.objects.get(username="C1")
        bad = "<script>"
        cust = Customer(
            user=user, fullname=bad, date_of_birth="2000-01-01", sex="", tel="08123"
        )
        cust.save()
        self.assertNotIn("<script>", cust.fullname)


class AddressModelTest(TestCase):
    def setUp(self):
        User.objects.create_user(username="A1", password="pass")
        self.user = User.objects.get(username="A1")

    def test_default_address_constraint(self):
        """[Normal] Only one default address per user"""
        Address.objects.create(
            user=self.user,
            receiver_name="R",
            house_number="1",
            district="D",
            province="P",
            post_code="12345",
            is_default=True,
        )
        with self.assertRaises(ValidationError):
            addr2 = Address(
                user=self.user,
                receiver_name="R2",
                house_number="2",
                district="D2",
                province="P2",
                post_code="12345",
                is_default=True,
            )
            addr2.full_clean()


class PaymentMethodModelTest(TestCase):
    def setUp(self):
        User.objects.create_user(username="PM1", password="pass")
        self.user = User.objects.get(username="PM1")

    def test_default_payment_unique(self):
        """[Normal] Only one default payment method per user"""
        UserPaymentMethod.objects.create(user=self.user, method="card", is_default=True)
        with self.assertRaises(ValidationError):
            pm2 = UserPaymentMethod(user=self.user, method="card2", is_default=True)
            pm2.full_clean()
