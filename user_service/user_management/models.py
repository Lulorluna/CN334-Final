import re
from django.db import models
from django.contrib.auth.models import User
from django.core.validators import RegexValidator
from django.db.models import Q, UniqueConstraint

numeric_validator = RegexValidator(
    regex=r"^\d+$", message="Telephone must contain only digits."
)


class Customer(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    fullname = models.CharField(max_length=255)
    date_of_birth = models.DateField()
    sex = models.CharField(max_length=10, blank=True)
    tel = models.CharField(max_length=20, validators=[numeric_validator])

    def clean(self):
        self.fullname = re.sub(r"<.*?>", "", self.fullname)
        super().clean()

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)

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

    class Meta:
        constraints = [
            UniqueConstraint(
                fields=["user"],
                condition=Q(is_default=True),
                name="unique_default_payment_per_user",
            )
        ]

    def save(self, *args, **kwargs):
        if self.is_default:
            UserPaymentMethod.objects.filter(user=self.user, is_default=True).exclude(
                pk=self.pk
            ).update(is_default=False)
        super().save(*args, **kwargs)

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

    class Meta:
        constraints = [
            UniqueConstraint(
                fields=["user"],
                condition=Q(is_default=True),
                name="unique_default_address_per_user",
            )
        ]

    def __str__(self):
        return f"{self.user.username} - {self.pk}"
