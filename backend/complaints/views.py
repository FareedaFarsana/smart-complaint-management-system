from django.shortcuts import render
from rest_framework.permissions import IsAuthenticated
from rest_framework import viewsets
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
from django.contrib.auth.models import User

from .models import Complaint, Feedback, ComplaintStatusHistory
from .serializers import ComplaintSerializer, FeedbackSerializer, ComplaintStatusHistorySerializer

from notifications.models import Notification

class ComplaintViewSet(viewsets.ModelViewSet):
    queryset = Complaint.objects.all()
    serializer_class = ComplaintSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):

        user = self.request.user

        if user.userprofile.role == "USER":
            return Complaint.objects.filter(user=user)

        if user.userprofile.role == "STAFF":
            return Complaint.objects.filter(assigned_staff=user)

        if user.userprofile.role == "ADMIN":
            return Complaint.objects.all()

        return Complaint.objects.none()
    
    filter_backends = [DjangoFilterBackend]

    filterset_fields = [
        'status',
        'priority',
        'category'
    ]

    
    def perform_create(self, serializer):
        role = self.request.user.userprofile.role

        if role not in ["ADMIN", "USER"]:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied(
                "Staff members are not allowed to create complaints."
            )

        complaint = serializer.save(user=self.request.user)

        # Save initial complaint status history
        ComplaintStatusHistory.objects.create(
            complaint=complaint,
            previous_status=None,
            new_status=complaint.status,
            changed_by=self.request.user
        )

        # Notify all administrators when a user creates a complaint
        if role == "USER":
            from django.contrib.auth.models import User

            admins = User.objects.filter(
                userprofile__role="ADMIN"
            )

            notifications = [
                Notification(
                    user=admin,
                    message=f'New complaint "{complaint.title}" has been submitted.'
                )
                for admin in admins
            ]

            Notification.objects.bulk_create(notifications)

    def perform_update(self, serializer):
        old_status = self.get_object().status
        old_assigned_staff_id = self.get_object().assigned_staff_id

        complaint = serializer.save()

        # Save complaint status history when status changes
        if old_status != complaint.status:
            ComplaintStatusHistory.objects.create(
                complaint=complaint,
                previous_status=old_status,
                new_status=complaint.status,
                changed_by=self.request.user
            )

        # Notify the complaint owner when its status changes
        if old_status != complaint.status:
            Notification.objects.create(
                user=complaint.user,
                message=(
                    f'Your complaint "{complaint.title}" '
                    f'is now {complaint.status}'
                )
            )

        # Notify newly assigned staff
        if (
            complaint.assigned_staff_id
            and old_assigned_staff_id != complaint.assigned_staff_id
        ):
            Notification.objects.create(
                user=complaint.assigned_staff,
                message=(
                    f'Complaint "{complaint.title}" '
                    f'has been assigned to you.'
                )
            )


    def destroy(self, request, *args, **kwargs):
        if request.user.userprofile.role != "ADMIN":
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied(
                "Only administrators can delete complaints."
            )

        return super().destroy(request, *args, **kwargs)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def submit_feedback(request):

    if request.user.userprofile.role != "USER":
        return Response(
            {"error": "Only students can submit feedback."},
            status=status.HTTP_403_FORBIDDEN
        )

    serializer = FeedbackSerializer(
        data=request.data,
        context={"request": request}
    )

    if serializer.is_valid():
        serializer.save(user=request.user)

        return Response(
            {
                "message": "Feedback submitted successfully!",
                "data": serializer.data
            },
            status=status.HTTP_201_CREATED
        )

    return Response(
        serializer.errors,
        status=status.HTTP_400_BAD_REQUEST
    )

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def check_feedback(request, complaint_id):

    try:
        feedback = Feedback.objects.get(
            complaint_id=complaint_id,
            user=request.user
        )

        return Response({
            "submitted": True,
            "feedback": FeedbackSerializer(feedback).data
        })

    except Feedback.DoesNotExist:
        return Response({
            "submitted": False
        })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_feedback(request):

    role = request.user.userprofile.role

    if role == "ADMIN":
        feedbacks = Feedback.objects.all().order_by('-created_at')

    elif role == "USER":
        feedbacks = Feedback.objects.filter(
            user=request.user
        ).order_by('-created_at')

    else:
        return Response(
            {"error": "You do not have permission to view feedback."},
            status=status.HTTP_403_FORBIDDEN
        )

    serializer = FeedbackSerializer(feedbacks, many=True)

    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_complaint_status_history(request, complaint_id):

    try:
        complaint = Complaint.objects.get(id=complaint_id)

    except Complaint.DoesNotExist:
        return Response(
            {"error": "Complaint not found."},
            status=status.HTTP_404_NOT_FOUND
        )

    role = request.user.userprofile.role

    # Check access permissions
    if role == "USER" and complaint.user != request.user:
        return Response(
            {"error": "You cannot access this complaint."},
            status=status.HTTP_403_FORBIDDEN
        )

    if role == "STAFF" and complaint.assigned_staff != request.user:
        return Response(
            {"error": "You cannot access this complaint."},
            status=status.HTTP_403_FORBIDDEN
        )

    if role not in ["ADMIN", "USER", "STAFF"]:
        return Response(
            {"error": "Permission denied."},
            status=status.HTTP_403_FORBIDDEN
        )

    history = ComplaintStatusHistory.objects.filter(
        complaint=complaint
    ).order_by('changed_at')

    serializer = ComplaintStatusHistorySerializer(
        history,
        many=True
    )

    return Response(serializer.data)


def check_and_escalate_complaints():

    now = timezone.now()

    overdue_complaints = Complaint.objects.filter(
        deadline__lt=now,
        is_escalated=False
    ).exclude(status="Resolved")

    admins = User.objects.filter(
        userprofile__role="ADMIN"
    )

    for complaint in overdue_complaints:

        complaint.is_escalated = True
        complaint.escalated_at = now

        complaint.save(
            update_fields=["is_escalated", "escalated_at"]
        )

        # Notify all administrators
        notifications = [
            Notification(
                user=admin,
                message=(
                    f'Complaint "{complaint.title}" '
                    f'has exceeded its deadline and was escalated.'
                )
            )
            for admin in admins
        ]

        Notification.objects.bulk_create(notifications)                        