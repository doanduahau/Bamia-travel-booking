from django.db import models
from django.contrib.auth.models import User

class SupportRequest(models.Model):
    REQUEST_TYPES = [
        ('FORGOT_PASSWORD', 'Quên mật khẩu'),
        ('REFUND', 'Hoàn tiền'),
        ('EDIT_INFO', 'Chỉnh sửa thông tin'),
        ('CONTACT', 'Liên hệ hỗ trợ'),
        ('OTHER', 'Khác'),
    ]
    
    STATUS_CHOICES = [
        ('PROCESSING', 'Đang xử lý'),
        ('COMPLETED', 'Đã hoàn thành'),
    ]
    
    # Optional user (for guest contact)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='support_requests', null=True, blank=True)
    
    # Guest info if user is null
    guest_name = models.CharField(max_length=100, null=True, blank=True)
    guest_email = models.EmailField(null=True, blank=True)
    
    request_type = models.CharField(max_length=20, choices=REQUEST_TYPES, default='CONTACT')
    content = models.TextField(blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PROCESSING')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        sender = self.user.username if self.user else f"{self.guest_name} (Guest)"
        return f"{sender} - {self.get_request_type_display()} ({self.get_status_display()})"
    
    class Meta:
        ordering = ['-created_at']

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    phone = models.CharField(max_length=20, blank=True, null=True)

    def __str__(self):
        return f"Profile for {self.user.username}"
