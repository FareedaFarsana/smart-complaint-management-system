from rest_framework import serializers
from django.contrib.auth.models import User


class AdminUserSerializer(serializers.ModelSerializer):

    role = serializers.CharField(
        source="userprofile.role",
        read_only=True
    )

    designation = serializers.CharField(
        source="userprofile.designation",
        read_only=True
    )

    phone = serializers.CharField(
        source="userprofile.phone",
        read_only=True
    )

    institution = serializers.CharField(
        source="userprofile.institution.institution_name",
        read_only=True
    )

    class Meta:
        model = User

        fields = [
            "id",
            "username",
            "email",
            "role",
            "designation",
            "phone",
            "institution"
        ]




class AdminUserUpdateSerializer(serializers.ModelSerializer):

    role = serializers.ChoiceField(
        choices=[
            ("ADMIN", "Admin"),
            ("STAFF", "Staff"),
            ("USER", "User"),
        ],
        source="userprofile.role"
    )

    designation = serializers.ChoiceField(
        choices=[
            ("STUDENT", "Student"),
            ("FACULTY", "Faculty"),
            ("ADMIN_STAFF", "Administrative Staff"),
            ("TECHNICAL_STAFF", "Technical Staff"),
            ("MAINTENANCE_STAFF", "Maintenance Staff"),
            ("OTHER", "Other"),
        ],
        source="userprofile.designation"
    )

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
            "role",
            "designation",
        ]
        read_only_fields = ["id", "username", "email"]

    def update(self, instance, validated_data):
        profile_data = validated_data.pop("userprofile", {})
        profile = instance.userprofile

        profile.role = profile_data.get("role", profile.role)
        profile.designation = profile_data.get(
            "designation", profile.designation
        )

        profile.save()
        return instance
