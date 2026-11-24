from rest_framework import serializers
from .models import Complaint, Feedback, ComplaintStatusHistory


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
        read_only_fields = [
            "user",
            "created_at",
            "is_escalated",
            "escalated_at"
        ]

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


class FeedbackSerializer(serializers.ModelSerializer):

    student_name = serializers.CharField(
        source="user.username",
        read_only=True
    )

    class Meta:
        model = Feedback
        fields = "__all__"
        read_only_fields = ["user", "created_at"]

    def validate_rating(self, value):
        if value < 1 or value > 5:
            raise serializers.ValidationError(
                "Rating must be between 1 and 5."
            )
        return value

    def validate(self, attrs):
        request = self.context.get("request")
        complaint = attrs.get("complaint")

        if complaint.status != "Resolved":
            raise serializers.ValidationError(
                "Feedback can only be submitted for resolved complaints."
            )

        if request and complaint.user != request.user:
            raise serializers.ValidationError(
                "You can submit feedback only for your own complaints."
            )

        return attrs

class ComplaintStatusHistorySerializer(serializers.ModelSerializer):

    changed_by_name = serializers.CharField(
        source="changed_by.username",
        read_only=True
    )

    class Meta:
        model = ComplaintStatusHistory
        fields = "__all__"
    