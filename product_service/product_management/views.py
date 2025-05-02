from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from product_management.models import Product
from product_management.serializers import ProductSerializer
from rest_framework import status


class ProductListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, format=None):
        products = Product.objects.all()
        serializer = ProductSerializer(products, many=True)
        return Response({"data": serializer.data}, status=status.HTTP_200_OK)


class ProductDetailView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, product_id, format=None):
        try:
            product = Product.objects.get(id=product_id)
            serializer = ProductSerializer(product)
            return Response({"data": serializer.data})
        except Product.DoesNotExist:
            return Response({"error": "Product not found"}, status=404)
