from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from .models import Product, Order, ProductOrder
from .serializers import ProductOrderSerializer


class AddToCartView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, format=None):
        product_id = request.data.get("product_id")
        quantity = int(request.data.get("quantity", 1))

        product = get_object_or_404(Product, pk=product_id)

        order, created = Order.objects.get_or_create(
            customer_id=request.user.id,
            status=Order.STATUS_PENDING,
            defaults={"shipping": None, "total_price": 0},
        )

        prod_order, po_created = ProductOrder.objects.get_or_create(
            order=order, product=product, defaults={"quantity": quantity}
        )
        if not po_created:
            prod_order.quantity += quantity
            prod_order.save()

        serializer = ProductOrderSerializer(prod_order)
        return Response(
            {"message": "Added to cart", "data": serializer.data},
            status=status.HTTP_201_CREATED,
        )
