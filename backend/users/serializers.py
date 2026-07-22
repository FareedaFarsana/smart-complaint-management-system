from django.contrib.auth.models import User
from rest_framework import serializers

from .models import InstitutionProfile

class RegisterSerializer(serializers.ModelSerializer):

    password = serializers.CharField(write_only=True)

    institution_name = serializers.CharField(write_only=True)

    institution_type = serializers.CharField(write_only=True)

    designation = serializers.CharField(write_only=True)

    phone = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = [
            "username",
            "email",
            "password",
            "institution_name",
            "institution_type",
            "designation",
            "phone"
        ]

    def create(self, validated_data):

        institution_name = validated_data.pop("institution_name")

        institution_type = validated_data.pop("institution_type")

        designation = validated_data.pop("designation")

        phone = validated_data.pop("phone")

        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password']
        )

        InstitutionProfile.objects.create(
            user=user,
            institution_name=institution_name,
            institution_type=institution_type,
            designation=designation,
            phone=phone
        )

        return user
    
    