from rest_framework import serializers
from .models import Category, Product


class CategorySerializer(serializers.ModelSerializer):
    product_count = serializers.IntegerField(source='products.count', read_only=True)

    class Meta:
        model = Category
        fields = ('id', 'name', 'slug', 'product_count')


class ProductSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)

    discount_percent = serializers.IntegerField(read_only=True)

    class Meta:
        model = Product
        fields = (
            'id', 'category', 'category_name', 'name', 'slug', 'description',
            'price', 'mrp', 'discount_percent', 'stock', 'image_url', 'rating',
            'rating_count', 'is_active', 'in_stock', 'created_at',
        )
        read_only_fields = ('created_at',)
