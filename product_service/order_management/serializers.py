from rest_framework import serializers
from order_management.models import *


class ProductOrderSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source="product.name", read_only=True)
    product_price = serializers.DecimalField(
        source="product.price", max_digits=12, decimal_places=2, read_only=True
    )

    class Meta:
        model = ProductOrder
        fields = [
            "id",
            "product",
            "product_name",
            "product_price",
            "quantity",
            "total_price",
        ]
        read_only_fields = ["id", "product_name", "product_price", "total_price"]


class OrderSerializer(serializers.ModelSerializer):
    items = ProductOrderSerializer(many=True, read_only=True)

    class Meta:
        model = Order
        fields = [
            "id",
            "customer_id",
            "shipping",
            "shipping_address_id",
            "user_payment_method_id",
            "total_price",
            "status",
            "create_at",
            "update_at",
            "items",
        ]


class ShippingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Shipping
        fields = "__all__"


class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = "__all__"
