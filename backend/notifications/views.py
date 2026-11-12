from django.shortcuts import render
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated

from .models import Notification
from .serializers import NotificationSerializer

class NotificationViewSet(viewsets.ModelViewSet):

    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):

        notifications = Notification.objects.filter(
            user=self.request.user
        ).order_by('-created_at')

        print("CURRENT USER:", self.request.user)
        print("NOTIFICATION COUNT:", notifications.count())
        print("NOTIFICATIONS:", list(
            notifications.values(
                'id',
                'user_id',
                'message',
                'is_read'
            )
        ))

        return notifications