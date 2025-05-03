from django.db import models
from django.contrib.auth.models import User


# Create your models here.
class Customer(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    fullname = models.CharField(max_length=255)
    date_of_birth = models.DateField()
    sex = models.CharField(max_length=10, blank=True)
    tel = models.CharField(max_length=20)

    def __str__(self):
        return self.user.username


class UserPaymentMethod(models.Model):
    user = models.ForeignKey(
        User, related_name="payment_methods", on_delete=models.CASCADE
    )
    method = models.CharField(max_length=50)
    card_no = models.CharField(max_length=20, blank=True)
    expired = models.CharField(max_length=5, blank=True)
    holder_name = models.CharField(max_length=255, blank=True)
    is_default = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.method}"


class Address(models.Model):
    user = models.ForeignKey(User, related_name="addresses", on_delete=models.CASCADE)
    receiver_name = models.CharField(max_length=255)
    house_number = models.CharField(max_length=20)
    district = models.CharField(max_length=100)
    province = models.CharField(max_length=100)
    post_code = models.CharField(max_length=5)
    is_default = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.user.username} - {self.pk}"
