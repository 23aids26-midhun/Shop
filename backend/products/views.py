from rest_framework import viewsets, permissions, filters
from django_filters.rest_framework import DjangoFilterBackend

from .models import Product, Category
from .serializers import ProductSerializer, CategorySerializer


class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    """GET /api/products/categories/ — public, unpaginated (there are only a few)."""
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = (permissions.AllowAny,)
    pagination_class = None


class ProductViewSet(viewsets.ModelViewSet):
    """
    GET  /api/products/products/                  -> paginated list (public)
    GET  /api/products/products/?category=1        -> filter by category id
    GET  /api/products/products/?search=shirt       -> search name/description
    GET  /api/products/products/?ordering=-price      -> sort
    GET  /api/products/products/<slug>/               -> detail (public)
    POST/PUT/PATCH/DELETE                                -> admin (is_staff) only
    """
    queryset = Product.objects.select_related('category').filter(is_active=True)
    serializer_class = ProductSerializer
    lookup_field = 'slug'
    filter_backends = (DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter)
    filterset_fields = ('category',)
    search_fields = ('name', 'description')
    ordering_fields = ('price', 'created_at', 'name', 'rating')

    def get_permissions(self):
        if self.action in ('create', 'update', 'partial_update', 'destroy'):
            return [permissions.IsAdminUser()]
        return [permissions.AllowAny()]
