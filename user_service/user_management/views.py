from django.http import HttpResponse, JsonResponse
from django.views.decorators.csrf import csrf_exempt
from rest_framework.parsers import JSONParser
from django.contrib.auth.models import User
from user_management.models import *
from user_management.serializers import *
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView


@csrf_exempt
def register(request):
    if request.method == "POST":
        data = JSONParser().parse(request)
        try:
            new_user = User.objects.create_user(
                username=data["username"],
                password=data["password"],
                email=data["email"],
            )
        except:
            return JsonResponse({"error": "username already used."}, status=400)
        new_user.save()
        data["user"] = new_user.id
        customer_serializer = CustomerSerializer(data=data)
        if customer_serializer.is_valid():
            customer_serializer.save()
            return JsonResponse(customer_serializer.data, status=201)
        new_user.delete()
        return JsonResponse({"error": "data not valid"}, status=400)
    return JsonResponse({"error": "method not allowed."}, status=405)


class CustomerView(APIView):
    permission_classes = [IsAuthenticated]

    def get_object(self, user):
        return Customer.objects.filter(user=user).first()

    def get(self, request, format=None):
        customer = self.get_object(request.user)
        if not customer:
            return Response(status=404)
        serializer = CustomerSerializer(customer)
        return Response({"data": serializer.data})

    def put(self, request, format=None):
        customer = self.get_object(request.user)
        if not customer:
            return Response(status=404)
        serializer = CustomerSerializer(
            customer,
            data=request.data,
            partial=True,
            context={"request": request},
        )
        if serializer.is_valid():
            serializer.save()
            return Response({"data": serializer.data})
        return Response(serializer.errors, status=400)


class UserView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, username):
        try:
            user = User.objects.get(username=username)
            serializer = UserSerializer(user)
            return Response(serializer.data, status=200)
        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=404)


class AddressListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, format=None):
        qs = Address.objects.filter(user=request.user)
        serializer = AddressSerializer(qs, many=True)
        return Response({"data": serializer.data})

    def post(self, request, format=None):
        serializer = AddressSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response({"data": serializer.data}, status=201)
        return Response(serializer.errors, status=400)


class AddressDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get_object(self, pk, user):
        return Address.objects.filter(pk=pk, user=user).first()

    def get(self, request, pk, format=None):
        addr = self.get_object(pk, request.user)
        if not addr:
            return Response(status=404)
        serializer = AddressSerializer(addr)
        return Response({"data": serializer.data})

    def put(self, request, pk, format=None):
        addr = self.get_object(pk, request.user)
        if not addr:
            return Response(status=404)
        serializer = AddressSerializer(addr, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({"data": serializer.data})
        return Response(serializer.errors, status=400)

    def delete(self, request, pk, format=None):
        addr = self.get_object(pk, request.user)
        if not addr:
            return Response(status=404)
        addr.delete()
        return Response(status=204)


class PaymentMethodListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, format=None):
        qs = UserPaymentMethod.objects.filter(user=request.user)
        serializer = UserPaymentMethodSerializer(qs, many=True)
        return Response({"data": serializer.data})

    def post(self, request, format=None):
        serializer = UserPaymentMethodSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response({"data": serializer.data}, status=201)
        return Response(serializer.errors, status=400)


class PaymentMethodDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get_object(self, pk, user):
        return UserPaymentMethod.objects.filter(pk=pk, user=user).first()

    def get(self, request, pk, format=None):
        pm = self.get_object(pk, request.user)
        if not pm:
            return Response(status=404)
        serializer = UserPaymentMethodSerializer(pm)
        return Response({"data": serializer.data})

    def put(self, request, pk, format=None):
        pm = self.get_object(pk, request.user)
        if not pm:
            return Response(status=404)
        serializer = UserPaymentMethodSerializer(pm, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({"data": serializer.data})
        return Response(serializer.errors, status=400)

    def delete(self, request, pk, format=None):
        pm = self.get_object(pk, request.user)
        if not pm:
            return Response(status=404)
        pm.delete()
        return Response(status=204)
