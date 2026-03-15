from rest_framework import serializers
from .models import Tour, Destination

class DestinationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Destination
        fields = '__all__'

class TourSerializer(serializers.ModelSerializer):
    # Trả về chi tiết Destination thay vì chỉ trả về mỗi ID
    location_detail = DestinationSerializer(source='location', read_only=True)

    class Meta:
        model = Tour
        fields = '__all__'