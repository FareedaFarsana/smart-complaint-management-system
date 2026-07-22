from django.db import models
from django.contrib.auth.models import User

class InstitutionProfile(models.Model):

    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE
    )

    institution_name = models.CharField(max_length=200)

    institution_type = models.CharField(max_length=100)

    designation = models.CharField(max_length=100)

    phone = models.CharField(max_length=15)

    def __str__(self):
        return self.institution_name
