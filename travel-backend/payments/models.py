from django.db import models
from django.contrib.auth.models import User
from bookings.models import Booking

class Transaction(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='transactions')
    bookings = models.ManyToManyField(Booking, related_name='transactions')
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    payment_method = models.CharField(max_length=50) # 'vnpay', 'momo', 'stripe'
    status = models.CharField(max_length=20, default='Pending') # 'Pending', 'Success', 'Failed'
    cart_item_ids = models.JSONField(default=list)  # Lưu lại cart IDs để xóa sau khi thanh toán thành công
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Transaction {self.id} - {self.user.username} - {self.status}"
