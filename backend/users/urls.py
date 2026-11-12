from django.urls import path
from .views import (
    RegisterView,
    AdminTestView, 
    AdminUserViewSet,
    MyProfileView,
    UpdateMyProfileView,
    ChangePasswordView,
    LogoutView,
)

from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from rest_framework.routers import DefaultRouter

router = DefaultRouter()

router.register(
    "admin-users",
    AdminUserViewSet,
    basename="admin-users"
)

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('admin-test/', AdminTestView.as_view(), name='admin-test'),
    path("me/", MyProfileView.as_view(), name="my-profile"),
    path("me/update/", UpdateMyProfileView.as_view(), name="update-my-profile"),
    path("change-password/", ChangePasswordView.as_view(), name="change-password"),
    path("logout/", LogoutView.as_view(), name="logout"),
]   

urlpatterns += router.urls