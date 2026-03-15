from rest_framework import serializers
from tours.serializers import TourSerializer
from .models import Booking, Cart

class BookingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Booking
        fields = '__all__'
        read_only_fields = ['user', 'status', 'total_price'] # Ngăn user tự sửa giá hoặc trạng thái
class CartSerializer(serializers.ModelSerializer):
    # Lấy luôn chi tiết Tour để Frontend hiển thị ảnh, tên, giá
    tour_detail = TourSerializer(source='tour', read_only=True)

    class Meta:
        model = Cart
        fields = '__all__'
        read_only_fields = ['user']