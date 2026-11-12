from django.db import models
from django.contrib.auth.models import User


class InstitutionProfile(models.Model):

    institution_name = models.CharField(max_length=200)

    institution_type = models.CharField(max_length=100)

    def __str__(self):
        return self.institution_name


class UserProfile(models.Model):

    ROLE_CHOICES = [
        ("ADMIN", "Admin"),
        ("STAFF", "Staff"),
        ("USER", "User"),
    ]

    DESIGNATION_CHOICES = [
        ("STUDENT", "Student"),
        ("FACULTY", "Faculty"),
        ("ADMIN_STAFF", "Administrative Staff"),
        ("TECHNICAL_STAFF", "Technical Staff"),
        ("MAINTENANCE_STAFF", "Maintenance Staff"),
        ("OTHER", "Other"),
    ]

    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE
    )

    institution = models.ForeignKey(
        InstitutionProfile,
        on_delete=models.CASCADE,
        related_name="users"
    )

    role = models.CharField(
        max_length=20,
        choices=ROLE_CHOICES,
        default="USER"
    )

    designation = models.CharField(
        max_length=30,
        choices=DESIGNATION_CHOICES
    )

    phone = models.CharField(max_length=15)

    def __str__(self):
        return self.user.username