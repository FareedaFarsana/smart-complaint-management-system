import re

from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers

from .models import InstitutionProfile, UserProfile


class RegisterSerializer(serializers.ModelSerializer):

    password = serializers.CharField(
        write_only=True,
        trim_whitespace=False,
        style={"input_type": "password"}
    )

    designation = serializers.CharField(write_only=True)
    phone = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = [
            "username",
            "email",
            "password",
            "designation",
            "phone",
        ]

    def validate_password(self, value):
        # Apply Django's configured password validators
        validate_password(value)
        return value

    def validate_email(self, value):
        # Prevent duplicate email addresses
        if User.objects.filter(email__iexact=value.strip()).exists():
            raise serializers.ValidationError(
                "An account with this email already exists."
            )
        return value.strip()

    def validate_phone(self, value):
        pattern = r'^[6-9]\d{9}$'

        if not re.match(pattern, value):
            raise serializers.ValidationError(
                "Enter a valid 10-digit Indian mobile number."
            )

        return value

    def create(self, validated_data):
        designation = validated_data.pop("designation")
        phone = validated_data.pop("phone")

        user = User.objects.create_user(
            username=validated_data["username"],
            email=validated_data["email"],
            password=validated_data["password"],
        )

        institution = InstitutionProfile.objects.get(
            institution_name="ABC Engineering College"
        )

        UserProfile.objects.create(
            user=user,
            institution=institution,
            role="USER",
            designation=designation,
            phone=phone,
        )

        return user
