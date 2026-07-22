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

    filter_backends = [DjangoFilterBackend]

    filterset_fields = [
        'status',
        'priority',
        'category'
    ]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    def perform_update(self, serializer):

        old_complaint = self.get_object()

        complaint = serializer.save()

        if old_complaint.status != complaint.status:

            Notification.objects.create(
                user=complaint.user,
                message=f'Your complaint "{complaint.title}" is now {complaint.status}'
            )
