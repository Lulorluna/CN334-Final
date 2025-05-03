from django.contrib import admin
from user_management.models import *

# Register your models here.
admin.site.register(Customer)
admin.site.register(UserPaymentMethod)
admin.site.register(Address)
