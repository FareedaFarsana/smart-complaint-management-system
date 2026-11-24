from rest_framework.routers import DefaultRouter
from django.urls import path

from .views import (
    ComplaintViewSet,
    submit_feedback,
    check_feedback,
    get_feedback,
    get_complaint_status_history
)

router = DefaultRouter()
router.register('complaints', ComplaintViewSet)

urlpatterns = [
    path('feedback/', submit_feedback, name='submit-feedback'),
    path('feedback/check/<int:complaint_id>/', check_feedback, name='check-feedback'),
    path('feedback/list/', get_feedback, name='get-feedback'),
    path('complaints/<int:complaint_id>/status-history/', get_complaint_status_history, name='complaint-status-history'),
] + router.urls