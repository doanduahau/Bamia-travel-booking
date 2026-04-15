from rest_framework import serializers
from tours.serializers import TourSerializer
from .models import Booking, Cart

from django.utils import timezone
from datetime import timedelta

class BookingSerializer(serializers.ModelSerializer):
    tour_detail = TourSerializer(source='tour', read_only=True)
    days_until_auto_delete = serializers.SerializerMethodField()

    class Meta:
        model = Booking
        fields = '__all__'
        read_only_fields = ['user', 'status', 'total_price']

    def get_days_until_auto_delete(self, obj):
        if obj.deleted_at:
            expiry_date = obj.deleted_at + timedelta(days=30)
            remaining = expiry_date - timezone.now()
            return max(0, remaining.days)
        return None

class CartSerializer(serializers.ModelSerializer):
    tour_detail = TourSerializer(source='tour', read_only=True)

    class Meta:
        model = Cart
        fields = '__all__'
        read_only_fields = ['user']