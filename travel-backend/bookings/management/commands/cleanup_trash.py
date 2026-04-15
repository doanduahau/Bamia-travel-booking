from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from bookings.models import Booking


class Command(BaseCommand):
    help = 'Xoá vĩnh viễn các booking trong thùng rác quá 30 ngày'

    def handle(self, *args, **options):
        cutoff = timezone.now() - timedelta(days=30)
        expired = Booking.objects.filter(
            deleted_at__isnull=False,
            deleted_at__lte=cutoff
        )
        count = expired.count()
        expired.delete()
        self.stdout.write(
            self.style.SUCCESS(
                f'Đã xoá vĩnh viễn {count} booking quá hạn trong thùng rác.'
            )
        )