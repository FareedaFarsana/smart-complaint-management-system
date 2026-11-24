from django.core.management.base import BaseCommand
from complaints.views import check_and_escalate_complaints


class Command(BaseCommand):

    help = "Check complaint deadlines and escalate overdue complaints"

    def handle(self, *args, **kwargs):

        check_and_escalate_complaints()

        self.stdout.write(
            self.style.SUCCESS(
                "Complaint deadlines checked successfully!"
            )
        )