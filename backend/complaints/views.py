from django.shortcuts import render
from rest_framework.permissions import IsAuthenticated
from rest_framework import viewsets
from django_filters.rest_framework import DjangoFilterBackend

from .models import Complaint
from .serializers import ComplaintSerializer

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