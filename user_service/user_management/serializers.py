from rest_framework import serializers
from user_management.models import *


class CustomerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Customer
        fields = ["id", "user", "fullname", "date_of_birth", "sex", "tel"]


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "email", "date_joined"]


class UserPaymentMethodSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserPaymentMethod
        fields = ["id", "method", "card_no", "expired", "holder_name", "is_default"]


class AddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = Address
        fields = [
            "id",
            "receiver_name",
            "house_number",
            "district",
            "province",
            "post_code",
            "is_default",
        ]
