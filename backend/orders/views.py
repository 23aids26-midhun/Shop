from rest_framework import permissions, status, generics
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db import transaction

from .models import Order, OrderItem
from .serializers import OrderSerializer, CreateOrderSerializer
from cart.models import Cart


class OrderListView(generics.ListAPIView):
    """
    GET /api/orders/  -> order history.

    Authorization: a plain user only ever sees their own orders — admins
    (is_staff) can see every order, useful for order management.
    """
    serializer_class = OrderSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        qs = Order.objects.prefetch_related('items').all()
        if self.request.user.is_staff:
            return qs
        return qs.filter(user=self.request.user)


class OrderDetailView(generics.RetrieveAPIView):
    """
    GET /api/orders/<id>/

    Authorization: scoped the same way as the list view — a non-admin
    user's queryset never includes anyone else's order, so requesting
    another user's order id returns 404, not someone else's data.
    """
    serializer_class = OrderSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        qs = Order.objects.prefetch_related('items').all()
        if self.request.user.is_staff:
            return qs
        return qs.filter(user=self.request.user)


class CheckoutView(APIView):
    """
    POST /api/orders/checkout/
    Body: { shipping_address, city, postal_code, country }

    Converts the current user's cart into an Order inside one atomic
    transaction (order created, stock decremented, cart emptied — all or
    nothing), after checking every item still has enough stock.
    """
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request):
        serializer = CreateOrderSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            cart = Cart.objects.get(user=request.user)
        except Cart.DoesNotExist:
            return Response({'detail': 'Cart is empty.'}, status=status.HTTP_400_BAD_REQUEST)

        cart_items = list(cart.items.select_related('product').all())
        if not cart_items:
            return Response({'detail': 'Cart is empty.'}, status=status.HTTP_400_BAD_REQUEST)

        for item in cart_items:
            if item.quantity > item.product.stock:
                return Response(
                    {'detail': f'Not enough stock for "{item.product.name}" (have {item.product.stock}, wanted {item.quantity}).'},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        with transaction.atomic():
            order = Order.objects.create(
                user=request.user,
                status='paid',
                total_price=cart.total_price,
                **serializer.validated_data,
            )
            for item in cart_items:
                OrderItem.objects.create(
                    order=order,
                    product=item.product,
                    product_name=item.product.name,
                    price=item.product.price,
                    quantity=item.quantity,
                )
                item.product.stock -= item.quantity
                item.product.save(update_fields=['stock'])
            cart.items.all().delete()

        return Response(OrderSerializer(order).data, status=status.HTTP_201_CREATED)
