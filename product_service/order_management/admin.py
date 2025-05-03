from django.contrib import admin
from order_management.models import *

# Register your models here.
admin.site.register(Order)
admin.site.register(Shipping)
admin.site.register(ProductOrder)
admin.site.register(Payment)
