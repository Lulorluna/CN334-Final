from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from order_management.models import *
from order_management.serializers import *
from product_management.serializers import ProductSerializer
from django.db import transaction

# pun add
from django.core.mail import send_mail
from django.conf import settings # เพื่อใช้ EMAIL_HOST_USER
from django.template.loader import render_to_string # สำหรับ HTML email (ทางเลือก)
# from user_service.user_management.models import *
# Render HTML email
from django.template.loader import render_to_string
from django.core.mail import send_mail
from django.utils.html import strip_tags
# Get address details from user_service
import requests


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
        try:
            quantity = int(request.data.get("quantity", 1))
        except (ValueError, TypeError):
            return Response({"error": "Quantity must be a number."}, status=400)

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


# class ConfirmOrderView(APIView):
#     permission_classes = [IsAuthenticated]

#     def post(self, request):
#         serializer = OrderConfirmSerializer(
#             data=request.data,
#             context={"request": request},
#         )
#         serializer.is_valid(raise_exception=True)
#         order = serializer.save()

#         for po in order.items.all():
#             if po.product.stock < po.quantity:
#                 return Response(
#                     {"error": f"Not enough stock for {po.product.name}"}, status=400
#                 )
#             po.product.stock -= po.quantity
#             po.product.save()

#         order.status = Order.STATUS_PENDING
#         order.save()

#         if order.payment_method == Order.PAYMENT_QR:
#             Payment.objects.create(order=order)

#         return Response({"order_id": order.id}, status=200)

class ConfirmOrderView(APIView):
    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def post(self, request):
        # 1. Validate input and retrieve/update order using the serializer
        serializer = OrderConfirmSerializer(
            data=request.data,
            context={"request": request},
        )
        serializer.is_valid(raise_exception=True)
        order = serializer.save()

        # 2. Check stock and deduct quantities
        product_orders = order.items.all()
        if not product_orders.exists():
             return Response({"error": "Cannot confirm an empty order."}, status=400)

        for po in product_orders:
            product = Product.objects.select_for_update().get(pk=po.product.pk)
            if product.stock < po.quantity:
                return Response(
                    {"error": f"Not enough stock for {product.name} (Available: {product.stock}). Order not confirmed."},
                    status=400
                )
            product.stock -= po.quantity
            product.save()

        # 3. Update Order Status
        order.status = Order.STATUS_PENDING
        order.save()

        # 4. Create Payment Record if using QR code
        if hasattr(order, 'payment_method') and order.payment_method == Order.PAYMENT_QR:
             if 'Payment' in globals() and issubclass(Payment, models.Model):
                 Payment.objects.create(order=order)
             else:
                 print(f"Warning: Payment model not found or imported for QR payment creation for order {order.id}")

        # 5. Send Confirmation Email
        try:
            customer_email = request.user.email
            if customer_email:
                subject = f"ยืนยันคำสั่งซื้อหมายเลข #{order.id}"

                # Prepare items data
                items = []
                total_items = 0
                for po in product_orders:
                    item_total = po.quantity * po.product.price
                    items.append({
                        'name': po.product.name,
                        'quantity': po.quantity,
                        'price': po.product.price,
                        'total': item_total
                    })
                    total_items += po.quantity

                html_message = render_to_string('order_confirmation_email.html', {
                    'order': order,
                    'user': request.user,
                    'items': items,
                    'total_items': total_items,
                    'shipping_fee': order.shipping.fee if order.shipping else 0,
                    'total_price': order.total_price
                })

                # Send email
                send_mail(
                    subject,
                    strip_tags(html_message),  # Plain text version
                    'mealofhope.official@gmail.com',
                    [customer_email],
                    html_message=html_message,  # HTML version
                    fail_silently=False,
                )
                print(f"ส่งอีเมลยืนยันคำสั่งซื้อไปยัง {customer_email} สำหรับคำสั่งซื้อ #{order.id}")
            else:
                print(f"ไม่พบอีเมลของผู้ใช้ {request.user.username} (ID: {request.user.id}) สำหรับคำสั่งซื้อ {order.id}")
        except Exception as e:
            print(f"เกิดข้อผิดพลาดในการส่งอีเมลยืนยันคำสั่งซื้อ {order.id}: {e}")

        return Response({"order_id": order.id, "message": "Order confirmed successfully. Confirmation email sent."}, status=200)



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
