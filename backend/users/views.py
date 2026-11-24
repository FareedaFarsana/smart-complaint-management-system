import re

from django.shortcuts import render
from rest_framework.generics import CreateAPIView
from django.contrib.auth.models import User
from .serializers import RegisterSerializer
# Password validation and secure password checking
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .permissions import IsAdmin

from rest_framework import viewsets, mixins
from .admin_serializers import (
    AdminUserSerializer,
    AdminUserUpdateSerializer
)

from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError

from .models import UserProfile

class RegisterView(CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer

class AdminTestView(APIView):

    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request):
        return Response({
            "message": "Admin access granted",
            "username": request.user.username,
            "role": request.user.userprofile.role
        })


class AdminUserViewSet(
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    viewsets.GenericViewSet
):
    # By default, retrieve all users and sort them by ID
    queryset = User.objects.all().order_by("id")
    permission_classes = [IsAdmin]


    # Return all users by default, or only Staff users when role=STAFF is requested
    def get_queryset(self):
        queryset = User.objects.all().order_by("id")

        if self.request.query_params.get("role") == "STAFF":
            queryset = queryset.filter(userprofile__role="STAFF")

        return queryset

    def get_serializer_class(self):

        if self.action in ["update", "partial_update"]:
            return AdminUserUpdateSerializer

        return AdminUserSerializer



# Return the logged-in user's profile details
class MyProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        profile = request.user.userprofile
        institution = profile.institution

        return Response({
            "id": request.user.id,
            "username": request.user.username,
            "email": request.user.email,
            "role": profile.role,
            "designation": profile.designation,
            "phone": profile.phone,
            "institution_name": institution.institution_name,
            "institution_type": institution.institution_type,
        })


# Update the logged-in user's profile
class UpdateMyProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request):
        user = request.user

        try:
            profile = user.userprofile
        except UserProfile.DoesNotExist:
            return Response(
                {"error": "User profile not found."},
                status=404
            )

        email = request.data.get("email", user.email)
        phone = request.data.get("phone", profile.phone)

        if not isinstance(email, str) or not isinstance(phone, str):
            return Response(
                {"error": "Email and phone must be text values."},
                status=400
            )

        email = email.strip()
        phone = phone.strip()

        # Validate Indian mobile number
        pattern = r'^[6-9]\d{9}$'

        if not re.fullmatch(pattern, phone):
            return Response(
                {
                    "phone": [
                        "Enter a valid 10-digit Indian mobile number."
                    ]
                },
                status=400
            )

        if not email:
            return Response(
                {"error": "Email cannot be empty."},
                status=400
            )

        if not phone:
            return Response(
                {"error": "Phone number cannot be empty."},
                status=400
            )

        user.email = email
        user.save(update_fields=["email"])

        profile.phone = phone
        profile.save(update_fields=["phone"])

        return Response({
            "message": "Profile updated successfully.",
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "role": profile.role,
            "designation": profile.designation,
            "phone": profile.phone,
            "institution_name": profile.institution.institution_name,
            "institution_type": profile.institution.institution_type,
        })

# Change the logged-in user's password
class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        current_password = request.data.get("current_password")
        new_password = request.data.get("new_password")
        confirm_password = request.data.get("confirm_password")

        # Check that all fields are provided
        if not current_password or not new_password or not confirm_password:
            return Response(
                {"error": "All password fields are required."},
                status=400
            )

        # Verify the current password
        user = request.user

        if not user.check_password(current_password):
            return Response(
                {"error": "Current password is incorrect."},
                status=400
            )

        # Check that the new passwords match
        if new_password != confirm_password:
            return Response(
                {"error": "New passwords do not match."},
                status=400
            )

        # Apply Django's configured password validation rules
        try:
            validate_password(new_password, user=user)
        except ValidationError as errors:
            return Response(
                {"error": list(errors.messages)},
                status=400
            )

        # Save the new password securely
        user.set_password(new_password)
        user.save(update_fields=["password"])

        return Response({
            "message": "Password changed successfully."
        })
    

# Secure logout by blacklisting the refresh token
class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        refresh_token = request.data.get("refresh")

        if not refresh_token:
            return Response(
                {"error": "Refresh token is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            token = RefreshToken(refresh_token)
            token.blacklist()

            return Response(
                {"message": "Logout successful."},
                status=status.HTTP_205_RESET_CONTENT,
            )

        except TokenError:
            return Response(
                {"error": "Invalid or expired refresh token."},
                status=status.HTTP_400_BAD_REQUEST,
            )