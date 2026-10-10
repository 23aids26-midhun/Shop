from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Cart, CartItem
from .serializers import CartSerializer
from products.models import Product


def get_or_create_cart(user):
    cart, _ = Cart.objects.get_or_create(user=user)
    return cart


class CartView(APIView):
    """GET /api/cart/  -> the logged-in user's own cart (created on first use)."""
    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request):
        cart = get_or_create_cart(request.user)
        return Response(CartSerializer(cart).data)


class CartAddItemView(APIView):
    """POST /api/cart/add/   { "product_id": 1, "quantity": 2 }"""
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request):
        cart = get_or_create_cart(request.user)
        product_id = request.data.get('product_id')
        try:
            quantity = int(request.data.get('quantity', 1))
        except (TypeError, ValueError):
            return Response({'detail': 'quantity must be a whole number.'}, status=status.HTTP_400_BAD_REQUEST)
        if quantity < 1:
            return Response({'detail': 'quantity must be at least 1.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            product = Product.objects.get(id=product_id, is_active=True)
        except Product.DoesNotExist:
            return Response({'detail': 'Product not found.'}, status=status.HTTP_404_NOT_FOUND)

        item, created = CartItem.objects.get_or_create(cart=cart, product=product)
        item.quantity = quantity if created else item.quantity + quantity
        item.save()
        return Response(CartSerializer(cart).data, status=status.HTTP_200_OK)


class CartUpdateItemView(APIView):
    """
    PUT    /api/cart/items/<id>/   { "quantity": 3 }
    DELETE /api/cart/items/<id>/

    Authorization: the item is looked up scoped to `cart=user's own cart`,
    so one user can never edit or delete another user's cart item, even by
    guessing an id.
    """
    permission_classes = (permissions.IsAuthenticated,)

    def put(self, request, item_id):
        cart = get_or_create_cart(request.user)
        try:
            item = CartItem.objects.get(id=item_id, cart=cart)
        except CartItem.DoesNotExist:
            return Response({'detail': 'Item not found.'}, status=status.HTTP_404_NOT_FOUND)

        try:
            quantity = int(request.data.get('quantity', item.quantity))
        except (TypeError, ValueError):
            return Response({'detail': 'quantity must be a whole number.'}, status=status.HTTP_400_BAD_REQUEST)

        if quantity <= 0:
            item.delete()
        else:
            item.quantity = quantity
            item.save()
        return Response(CartSerializer(cart).data)

    def delete(self, request, item_id):
        cart = get_or_create_cart(request.user)
        CartItem.objects.filter(id=item_id, cart=cart).delete()
        return Response(CartSerializer(cart).data)
