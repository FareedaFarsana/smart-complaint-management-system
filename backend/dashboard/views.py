
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from complaints.models import Complaint
from categories.models import Category
from complaints.serializers import ComplaintSerializer


class DashboardStatsAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        role = user.userprofile.role

        # Select complaints according to the logged-in user's role
        if role == "ADMIN":
            complaints = Complaint.objects.all()
        elif role == "STAFF":
            complaints = Complaint.objects.filter(assigned_staff=user)
        else:
            complaints = Complaint.objects.filter(user=user)

        # Calculate statistics for the selected complaints
        total = complaints.count()
        pending = complaints.filter(status="Pending").count()
        in_progress = complaints.filter(status="In Progress").count()
        resolved = complaints.filter(status="Resolved").count()

        # Get the five most recent relevant complaints
        recent_complaints = complaints.order_by("-created_at")[:5]
        serializer = ComplaintSerializer(
            recent_complaints,
            many=True,
            context={"request": request}
        )

        # Only Admin needs system-wide category statistics
        category_counts = []

        if role == "ADMIN":
            for category in Category.objects.all():
                category_counts.append({
                    "category_name": category.category_name,
                    "count": complaints.filter(category=category).count()
                })

        return Response({
            "role": role,
            "statistics": {
                "total_complaints": total,
                "pending": pending,
                "in_progress": in_progress,
                "resolved": resolved,
                "categories": len(category_counts)
            },
            "recent_complaints": serializer.data,
            "category_counts": category_counts
        })
