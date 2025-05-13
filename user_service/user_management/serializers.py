import re
from rest_framework import serializers
from user_management.models import *
from django.utils.html import strip_tags
from django.contrib.auth import password_validation


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["username", "email"]


class CustomerSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    user_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(), write_only=True, source="user"
    )

    class Meta:
        model = Customer
        fields = ["id", "user", "user_id", "fullname", "date_of_birth", "sex", "tel"]

    def validate_fullname(self, value):
        if re.search(r"<\s*script", value, re.IGNORECASE):
            raise serializers.ValidationError("Invalid characters in fullname")
        return strip_tags(value)

    def update(self, instance, validated_data):
        user_data = validated_data.pop("user", None)
        if user_data:
            user = instance.user
            if user.username != user_data.get("username", user.username):
                user.username = user_data.get("username", user.username)
            user.email = user_data.get("email", user.email)
            user.save()

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        return instance


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


class ChangePasswordSerializer(serializers.Serializer):
    new_password = serializers.CharField(write_only=True, min_length=8)
    confirm_password = serializers.CharField(write_only=True, min_length=8)

    def validate(self, attrs):
        pw1 = attrs.get("new_password")
        pw2 = attrs.get("confirm_password")
        if pw1 != pw2:
            raise serializers.ValidationError(
                {"confirm_password": "รหัสผ่านทั้งสองช่องต้องตรงกัน"}
            )
        password_validation.validate_password(pw1, self.context["request"].user)
        return attrs
