from django.db import models
from categories.models import Category
from django.contrib.auth.models import User

# Create your models here.
class Complaint(models.Model):

    PRIORITY_CHOICES = [
        ('Low', 'Low'),
        ('Medium', 'Medium'),
        ('High', 'High'),
    ]

    STATUS_CHOICES = [
        ('Pending', 'Pending'),
        ('In Progress', 'In Progress'),
        ('Resolved', 'Resolved'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE)

    assigned_staff = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='assigned_complaints'
    )

    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='complaints')

    title = models.CharField(max_length=200)
    description = models.TextField()

    priority = models.CharField(max_length=20, choices=PRIORITY_CHOICES, default='Low')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Pending')

    # Deadline and Escalation
    deadline = models.DateTimeField(null=True, blank=True)

    is_escalated = models.BooleanField(default=False)

    escalated_at = models.DateTimeField(null=True, blank=True)

    image = models.ImageField(upload_to='complaints/', null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title


class Feedback(models.Model):

    EXPERIENCE_CHOICES = [
        (1, 'Very Poor'),
        (2, 'Poor'),
        (3, 'Average'),
        (4, 'Good'),
        (5, 'Excellent'),
    ]

    complaint = models.OneToOneField(
        Complaint,
        on_delete=models.CASCADE,
        related_name='feedback'
    )

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='submitted_feedback'
    )

    rating = models.PositiveSmallIntegerField()

    service_experience = models.PositiveSmallIntegerField(
        choices=EXPERIENCE_CHOICES
    )

    comments = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Feedback for {self.complaint.title}"


class ComplaintStatusHistory(models.Model):

    complaint = models.ForeignKey(
        Complaint,
        on_delete=models.CASCADE,
        related_name='status_history'
    )

    previous_status = models.CharField(
        max_length=20,
        null=True,
        blank=True
    )

    new_status = models.CharField(max_length=20)

    changed_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )

    changed_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.complaint.title} - {self.new_status}"