from django.contrib import admin
from order_management.models import *


# Register your models here.
@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ("id", "customer", "status", "total_price", "create_at")
    readonly_fields = ("total_price",)


admin.site.register(Shipping)
admin.site.register(ProductOrder)
admin.site.register(Payment)
