from django.db import models
from django.contrib.auth.models import User
from tours.models import Tour

class Booking(models.Model):
    STATUS_CHOICES = (
        ('Pending', 'Pending'),
        ('Confirmed', 'Confirmed'),
        ('Paid', 'Paid'),
        ('Cancelled', 'Cancelled'),
    )
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='bookings')
    tour = models.ForeignKey(Tour, on_delete=models.CASCADE)
    date = models.DateField()
    number_of_people = models.IntegerField(default=1)
    total_price = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Pending')
    created_at = models.DateTimeField(auto_now_add=True)

class Cart(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='cart')
    tour = models.ForeignKey(Tour, on_delete=models.CASCADE)
    date = models.DateField(null=True, blank=True) # Ngày dự kiến đi
    number_of_people = models.IntegerField(default=1) # Số lượng người
    added_at = models.DateTimeField(auto_now_add=True)