from rest_framework import serializers
from .models import Complaint


class ComplaintSerializer(serializers.ModelSerializer):

    category_name = serializers.CharField(
        source="category.category_name",
        read_only=True
    )

    assigned_staff_name = serializers.CharField(
        source="assigned_staff.username",
        read_only=True,
        allow_null=True
    )

    class Meta:
        model = Complaint
        fields = "__all__"
        read_only_fields = ["user", "created_at"]

    def validate(self, attrs):
        request = self.context.get("request")

        if request and self.instance:
            role = request.user.userprofile.role

            if role == "STAFF":

                # Check the actual fields being updated
                submitted_fields = set(attrs.keys())

                allowed_fields = {"status"}

                forbidden_fields = submitted_fields - allowed_fields

                if forbidden_fields:
                    raise serializers.ValidationError(
                        "Staff can update only the complaint status."
                    )

                new_status = attrs.get("status")
                current_status = self.instance.status

                if new_status and new_status != current_status:

                    allowed_transitions = {
                        "Pending": ["In Progress"],
                        "In Progress": ["Resolved"],
                        "Resolved": [],
                    }

                    if new_status not in allowed_transitions[current_status]:
                        raise serializers.ValidationError({
                            "status": (
                                f"Cannot change status from {current_status} "
                                f"to {new_status}."
                            )
                        })

            elif role == "USER":
                raise serializers.ValidationError(
                    "Users are not allowed to update complaints."
                )

        return attrs