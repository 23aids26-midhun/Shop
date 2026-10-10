from rest_framework import generics, permissions, viewsets, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import get_user_model

from .models import Address
from .serializers import (
    RegisterSerializer, UserSerializer, AddressSerializer, ChangePasswordSerializer,
)

User = get_user_model()


class RegisterView(generics.CreateAPIView):
    """POST /api/accounts/register/  -> Sign Up (open to anyone)."""
    queryset = User.objects.all()
    permission_classes = (permissions.AllowAny,)
    serializer_class = RegisterSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response(
            {'message': f'Account created. Welcome, {user.username}! (id #{user.id})'},
            status=201,
        )


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    Sign In: issues a JWT access + refresh token pair, and embeds the user
    object in the response so the frontend doesn't need a second request
    right after logging in.
    """

    def validate(self, attrs):
        data = super().validate(attrs)
        data['user'] = UserSerializer(self.user).data
        return data


class LoginView(TokenObtainPairView):
    """POST /api/accounts/login/  -> Sign In."""
    serializer_class = CustomTokenObtainPairSerializer


class ProfileView(APIView):
    """GET/PUT /api/accounts/profile/  -> the logged-in user's own profile."""
    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request):
        return Response(UserSerializer(request.user).data)

    def put(self, request):
        serializer = UserSerializer(request.user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


class ChangePasswordView(APIView):
    """
    POST /api/accounts/change-password/  -> "Login & Security" panel.
    Requires the current password, so a stolen access token alone can't be
    used to lock the real owner out of their account.
    """
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        if not request.user.check_password(serializer.validated_data['old_password']):
            return Response({'old_password': 'Current password is incorrect.'}, status=status.HTTP_400_BAD_REQUEST)

        request.user.set_password(serializer.validated_data['new_password'])
        request.user.save(update_fields=['password'])
        return Response({'message': 'Password updated. Use your new password next time you sign in.'})


class AddressViewSet(viewsets.ModelViewSet):
    """
    /api/accounts/addresses/           GET (list mine), POST (add one)
    /api/accounts/addresses/<id>/      GET/PUT/PATCH/DELETE (mine only)

    Authorization: scoped to request.user in get_queryset, so a user can
    never list, read, edit or delete another user's saved address, even by
    guessing an id.
    """
    serializer_class = AddressSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        return Address.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
