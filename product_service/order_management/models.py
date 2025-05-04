from django.db import models
from product_management.models import Product
from django.core.validators import MinValueValidator
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.contrib.auth.models import User


# Create your models here.
class Shipping(models.Model):
    method = models.CharField(max_length=255)
    fee = models.FloatField()
    tel = models.CharField(max_length=20, blank=True)

    def __str__(self):
        return self.method


class Order(models.Model):
    STATUS_CART = "cart"
    STATUS_PENDING = "pending"
    STATUS_PAID = "paid"
    STATUS_PROCESSING = "processing"
    STATUS_IN_TRANSIT = "in_transit"
    STATUS_SHIPPED = "shipped"
    STATUS_CHOICES = [
        (STATUS_CART, "ตะกร้า"),
        (STATUS_PENDING, "รอชำระเงิน"),
        (STATUS_PAID, "ชำระเงินแล้ว"),
        (STATUS_PROCESSING, "กำลังเตรียมของ"),
        (STATUS_IN_TRANSIT, "กำลังจัดส่ง"),
        (STATUS_SHIPPED, "จัดส่งแล้ว"),
    ]
    customer = models.ForeignKey(User, on_delete=models.CASCADE, default=1)
    shipping = models.ForeignKey(Shipping, on_delete=models.SET_NULL, null=True)
    shipping_address_id = models.IntegerField(null=True, blank=True)
    user_payment_method_id = models.IntegerField(null=True)
    total_price = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        validators=[MinValueValidator(0)],
        editable=False,
        default=0,
    )
    status = models.CharField(
        max_length=20, choices=STATUS_CHOICES, default=STATUS_PENDING
    )
    create_at = models.DateTimeField(auto_now_add=True)
    update_at = models.DateTimeField(auto_now=True)

    @property
    def calculated_total(self):
        return sum(item.total_price for item in self.items.all())

    def __str__(self):
        return f"Order: {self.pk} - {self.customer_id}"


class ProductOrder(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    order = models.ForeignKey(Order, related_name="items", on_delete=models.CASCADE)
    quantity = models.IntegerField()

    @property
    def total_price(self):
        return self.product.price * self.quantity

    def save(self, *args, **kwargs):
        # เช็คว่า order เป็นตะกร้า
        if self.order.status == Order.STATUS_CART:
            existing = (
                ProductOrder.objects.filter(order=self.order, product=self.product)
                .exclude(pk=self.pk)
                .first()
            )
            existing_quantity = existing.quantity if existing else 0
            total_quantity = self.quantity + existing_quantity

            if total_quantity > self.product.stock:
                raise ValueError(f"จำนวนสินค้าเกิน stock ที่มีอยู่ ({self.product.stock})")

        super().save(*args, **kwargs)

    def __str__(self):
        return f"Order {self.order.pk}: {self.product.name}"


class Payment(models.Model):
    order = models.OneToOneField(
        Order, related_name="payment", on_delete=models.CASCADE
    )
    paid_at = models.DateTimeField(auto_now_add=True)
    amount = models.FloatField()

    def save(self, *args, **kwargs):
        shipping_fee = self.order.shipping.fee if self.order.shipping else 0
        self.amount = float(self.order.total_price) + float(shipping_fee)
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Payment of customer{self.order.customer_id}: order{self.order.pk}"


@receiver([post_save, post_delete], sender=ProductOrder)
def update_order_total(sender, instance, **kwargs):
    order = instance.order
    order.total_price = order.calculated_total
    order.save()
