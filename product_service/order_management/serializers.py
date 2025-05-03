from rest_framework import serializers
from order_management.models import ProductOrder


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
