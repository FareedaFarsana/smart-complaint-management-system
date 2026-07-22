from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from complaints.models import Complaint
from categories.models import Category

from complaints.serializers import ComplaintSerializer


class DashboardStatsAPIView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        total = Complaint.objects.count()

        pending = Complaint.objects.filter(
            status="Pending"
        ).count()

        in_progress = Complaint.objects.filter(
            status="In Progress"
        ).count()

        resolved = Complaint.objects.filter(
            status="Resolved"
        ).count()

        categories = Category.objects.count()

        recent_complaints = Complaint.objects.order_by(
            "-created_at"
        )[:5]


        serializer = ComplaintSerializer(
            recent_complaints,
            many=True
        )

        return Response({

            "statistics": {

                "total_complaints": total,

                "pending": pending,

                "in_progress": in_progress,

                "resolved": resolved,

                "categories": categories

            },

            "recent_complaints": serializer.data

        })
    

    
