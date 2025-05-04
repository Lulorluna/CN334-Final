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


class ProductOrderDetailSerializer(serializers.ModelSerializer):
    name = serializers.CharField(source="product.name", read_only=True)
    price = serializers.DecimalField(
        source="product.price", max_digits=12, decimal_places=2, read_only=True
    )
    product = serializers.IntegerField(source="product.id", read_only=True)

    class Meta:
        model = ProductOrder
        fields = ["product", "name", "price", "quantity"]


class OrderDetailSerializer(serializers.ModelSerializer):
    items = ProductOrderDetailSerializer(many=True, read_only=True)
    total_price = serializers.DecimalField(
        max_digits=12, decimal_places=2, read_only=True
    )
    shipping_fee = serializers.SerializerMethodField()
    shipping_method = serializers.SerializerMethodField()
    shipping_address = serializers.IntegerField(read_only=True)

    class Meta:
        model = Order
        fields = [
            "id",
            "create_at",
            "items",
            "total_price",
            "shipping_fee",
            "shipping_method",
            "shipping_address",
        ]

    def get_shipping_fee(self, obj):
        return float(obj.shipping.fee) if obj.shipping else 0.0

    def get_shipping_method(self, obj):
        return obj.shipping.method if obj.shipping else None


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


class OrderHistorySerializer(serializers.ModelSerializer):
    items = ProductOrderSerializer(many=True, read_only=True)

    class Meta:
        model = Order
        fields = [
            "id",
            "total_price",
            "status",
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
