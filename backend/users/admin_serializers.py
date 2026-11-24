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

    def validate(self, attrs):

        profile_data = attrs.get("userprofile", {})

        current_profile = self.instance.userprofile

        role = profile_data.get("role", current_profile.role)

        designation = profile_data.get(
            "designation",
            current_profile.designation
        )

        # Prevent editing ADMIN accounts
        if current_profile.role == "ADMIN":
            raise serializers.ValidationError(
                "Admin accounts cannot be modified here."
            )

        # Validate USER designation
        if role == "USER":
            allowed_designations = ["STUDENT", "OTHER"]

            if designation not in allowed_designations:
                raise serializers.ValidationError({
                    "designation": "Users can only have Student or Other designation."
                })

        # Validate STAFF designation
        elif role == "STAFF":
            allowed_designations = [
                "FACULTY",
                "ADMIN_STAFF",
                "TECHNICAL_STAFF",
                "MAINTENANCE_STAFF",
                "OTHER",
            ]

            if designation not in allowed_designations:
                raise serializers.ValidationError({
                    "designation": "Staff must have a valid staff designation."
                })

        return attrs

    def update(self, instance, validated_data):

        profile_data = validated_data.pop("userprofile", {})

        profile = instance.userprofile

        profile.role = profile_data.get("role", profile.role)

        profile.designation = profile_data.get(
            "designation",
            profile.designation
        )

        profile.save()

        return instance


    