"""
URL configuration for product_service project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""

from django.contrib import admin
from django.urls import path
from product_management.views import *
from order_management.views import *


urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/product/all/", ProductListView.as_view(), name="product-list"),
    path(
        "api/product/<int:product_id>/",
        ProductDetailView.as_view(),
        name="product-detail",
    ),
    path("api/order/<int:id>/", OrderDetailView.as_view(), name="order-detail"),
    path("api/history/", UserOrderListView.as_view(), name="user-orders"),
    path("api/cart/", CartOrderView.as_view(), name="cart-orders"),
    path(
        "api/orders/products/<int:order_id>",
        ProductsInUserOrdersView.as_view(),
        name="products-in-orders",
    ),
    path("api/cart/add/", AddToCartView.as_view(), name="add-to-cart"),
    path(
        "api/cart/remove/<int:product_id>/",
        RemoveFromCartView.as_view(),
        name="remove-from-cart",
    ),
    path("api/cart/update/<int:product_id>/", UpdateCartItemView.as_view()),
    path("api/order/confirm/", ConfirmOrderView.as_view(), name="confirm-order"),
    path("api/shipping/", ShippingListView.as_view(), name="shipping-list"),
    path(
        "api/payment/<int:order_id>/",
        PaymentByOrderView.as_view(),
        name="payment-by-order",
    ),
]
