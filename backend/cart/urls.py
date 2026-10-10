from django.urls import path
from .views import CartView, CartAddItemView, CartUpdateItemView

urlpatterns = [
    path('', CartView.as_view(), name='cart'),
    path('add/', CartAddItemView.as_view(), name='cart-add'),
    path('items/<int:item_id>/', CartUpdateItemView.as_view(), name='cart-item'),
]
