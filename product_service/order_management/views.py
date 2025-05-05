from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from order_management.models import *
from order_management.serializers import *
from product_management.serializers import ProductSerializer


class UserOrderListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        orders = Order.objects.filter(customer=request.user)
        serializer = OrderHistorySerializer(orders, many=True)
        return Response({"orders": serializer.data})


class CartOrderView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        cart_orders = Order.objects.filter(
            customer=request.user, status=Order.STATUS_CART
        )
        serializer = OrderSerializer(cart_orders, many=True)
        return Response({"cart_orders": serializer.data})


class ProductsInUserOrdersView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, order_id):
        try:
            order = Order.objects.get(id=order_id, customer=request.user)
        except Order.DoesNotExist:
            return Response(
                {"error": "Order not found or not belongs to the user"}, status=404
            )

        product_orders = ProductOrder.objects.filter(order=order)
        products = [po.product for po in product_orders]

        serializer = ProductSerializer(products, many=True)
        return Response({"products": serializer.data})


class OrderDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, id, format=None):
        # หาเฉพาะ order ของ user ที่ตรงกับ id
        try:
            order = Order.objects.get(pk=id, customer=request.user)
        except Order.DoesNotExist:
            return Response({"detail": "Order not found"}, status=404)

        serializer = OrderDetailSerializer(order)
        return Response(serializer.data, status=200)


class AddToCartView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, format=None):
        product_id = request.data.get("product_id")
        quantity = int(request.data.get("quantity", 1))

        product = get_object_or_404(Product, pk=product_id)

        order, created = Order.objects.get_or_create(
            customer=request.user,
            status=Order.STATUS_CART,
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
            status=201,
        )


class RemoveFromCartView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, product_id):
        try:
            product = Product.objects.get(id=product_id)
        except Product.DoesNotExist:
            return Response({"error": "Product not found"}, status=404)

        order = Order.objects.filter(
            customer=request.user, status=Order.STATUS_CART
        ).first()
        if not order:
            return Response({"error": "Cart not found"}, status=404)

        product_order = ProductOrder.objects.filter(
            order=order, product=product
        ).first()
        if not product_order:
            return Response({"error": "Product not in cart"}, status=404)

        product_order.delete()

        return Response({"message": "Product removed from cart"}, status=200)


class UpdateCartItemView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, product_id):
        order = Order.objects.filter(
            customer=request.user, status=Order.STATUS_CART
        ).first()
        if not order:
            return Response({"error": "Cart not found"}, status=404)

        prod_order = ProductOrder.objects.filter(
            order=order, product_id=product_id
        ).first()
        if not prod_order:
            return Response({"error": "Product not in cart"}, status=404)

        new_qty = request.data.get("quantity")
        try:
            new_qty = int(new_qty)
        except (TypeError, ValueError):
            return Response({"error": "Invalid quantity"}, status=404)

        if new_qty < 1:
            prod_order.delete()
            return Response({"message": "Product removed from cart"}, status=200)

        product = get_object_or_404(Product, pk=product_id)
        if product.stock < new_qty:
            return Response(
                {"error": f"Not enough stock (available {product.stock})"},
                status=400,
            )

        prod_order.quantity = new_qty
        prod_order.save()

        serializer = ProductOrderSerializer(prod_order)
        return Response({"message": "Quantity updated", "data": serializer.data})


class ConfirmOrderView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        order = Order.objects.filter(
            customer=request.user, status=Order.STATUS_CART
        ).first()
        if not order:
            return Response({"error": "Order not found or not in cart"}, status=404)

        address_id = request.data.get("address_id")
        payment_id = request.data.get("payment_id")
        shipping_id = request.data.get("shipping_id")

        if not all([address_id, payment_id, shipping_id]):
            return Response(
                {"error": "address_id, payment_id และ shipping_id ต้องระบุให้ครบ"},
                status=400,
            )

        order.shipping_address_id = address_id
        order.user_payment_method_id = payment_id

        shipping_obj = get_object_or_404(Shipping, pk=shipping_id)
        order.shipping = shipping_obj

        order.save()

        order.status = Order.STATUS_PROCESSING
        order.save()

        for po in ProductOrder.objects.filter(order=order):
            if po.product.stock >= po.quantity:
                po.product.stock -= po.quantity
                po.product.save()
            else:
                return Response(
                    {"error": f"Not enough stock for {po.product.name}"}, status=400
                )

        return Response(
            {"message": "Order confirmed and stock updated", "order_id": order.id},
            status=200,
        )


class ShippingListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        shipping_methods = Shipping.objects.all()
        serializer = ShippingSerializer(shipping_methods, many=True)
        return Response({"data": serializer.data})


class PaymentByOrderView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, order_id):
        payment = get_object_or_404(Payment, order_id=order_id)
        serializer = PaymentSerializer(payment)
        return Response({"data": serializer.data})
