from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.db.models import Avg
from .models import Review

@receiver(post_save, sender=Review)
@receiver(post_delete, sender=Review)
def update_tour_rating(sender, instance, **kwargs):
    """
    Tự động cập nhật thuộc tính rating của Tour mỗi khi có Review mới
    hoặc một Review bị xóa.
    """
    tour = instance.tour
    # Tính toán lại trung bình số sao. Nếu chưa có đánh giá nào thì là 0.
    avg_rating = tour.reviews.aggregate(Avg('rating'))['rating__avg']
    tour.rating = round(avg_rating, 1) if avg_rating is not None else 0.0
    tour.save()
