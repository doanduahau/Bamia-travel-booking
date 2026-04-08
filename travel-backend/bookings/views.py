from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import Booking, Cart
from .serializers import BookingSerializer, CartSerializer
import re
from rest_framework.decorators import action
from rest_framework import status
from datetime import timedelta
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.permissions import IsAdminUser
from django.contrib.auth.models import User
from tours.models import Tour
from .models import Booking
class BookingViewSet(viewsets.ModelViewSet):
    serializer_class = BookingSerializer
    permission_classes = [IsAuthenticated] # Bắt buộc đăng nhập

    def get_queryset(self):
        # Chỉ trả về danh sách booking của user đang đăng nhập, loại trừ đã hủy
        return Booking.objects.filter(user=self.request.user).exclude(status='Cancelled')

    def perform_create(self, serializer):
        # Tự động gán user hiện tại và tính toán tổng tiền
        tour = serializer.validated_data['tour']
        people = serializer.validated_data.get('number_of_people', 1)
        total_price = tour.price * people
        serializer.save(user=self.request.user, total_price=total_price)
        
    @action(detail=True, methods=['patch'], url_path='cancel')
    def cancel(self, request, pk=None):
        booking = self.get_object()
        if booking.status == 'Pending':
            booking.delete()
            return Response({'status': 'Đã hủy đơn hàng và xoá khỏi lịch'}, status=status.HTTP_200_OK)
        return Response({'error': 'Không thể hủy đơn hàng này'}, status=status.HTTP_400_BAD_REQUEST)

class CartViewSet(viewsets.ModelViewSet):
    serializer_class = CartSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Cart.objects.filter(user=self.request.user).order_by('-added_at')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class MyItineraryView(APIView):
    permission_classes = [IsAuthenticated]

    def get_end_date(self, start_date, duration_str):
        if not start_date:
            return None
        # Trích xuất con số đầu tiên từ chuỗi duration (vd: "3 ngày 2 đêm" -> 3)
        match = re.search(r'\d+', str(duration_str))
        days = int(match.group()) if match else 1
        return start_date + timedelta(days=days - 1)

    def get(self, request):
        bookings = Booking.objects.filter(user=request.user).exclude(status='Cancelled')
        cart_items = Cart.objects.filter(user=request.user)
        
        events = []
        
        # 1. Thêm Tour đã đặt - phân loại theo trạng thái
        for b in bookings:
            if b.date:
                end_date = self.get_end_date(b.date, b.tour.duration)

                if b.status == 'Pending':
                    # Màu vàng cho tour chờ thanh toán
                    bg_color = '#F59E0B'   # amber-400
                    border_color = '#D97706'  # amber-600
                    label = f"[Chờ thanh toán] {b.tour.title}"
                elif b.status == 'Paid':
                    # Màu xanh lá cho tour đã thanh toán
                    bg_color = '#10B981'   # emerald-500
                    border_color = '#059669'
                    label = f"[Đã thanh toán] {b.tour.title}"
                else:
                    # Confirmed hoặc trạng thái khác - xanh lá nhạt
                    bg_color = '#34D399'
                    border_color = '#10B981'
                    label = f"[Đã đặt] {b.tour.title}"

                events.append({
                    'id': f'booking_{b.id}',
                    'title': label,
                    'start': b.date.strftime('%Y-%m-%d'),
                    'end': (end_date + timedelta(days=1)).strftime('%Y-%m-%d'),
                    'allDay': True,
                    'display': 'block',
                    'backgroundColor': bg_color,
                    'borderColor': border_color,
                    'extendedProps': {
                        'status': b.status,
                        'tour_id': b.tour.id,
                        'location_name': b.tour.location.name if b.tour.location else ''
                    }
                })
        
        # 2. Thêm Tour trong giỏ hàng (Màu Cam)
        for c in cart_items:
            if c.date:
                end_date = self.get_end_date(c.date, c.tour.duration)
                events.append({
                    'id': f'cart_{c.id}',
                    'title': f"[Giỏ hàng] {c.tour.title}",
                    'start': c.date.strftime('%Y-%m-%d'),
                    'end': (end_date + timedelta(days=1)).strftime('%Y-%m-%d'),
                    'allDay': True,
                    'display': 'block',
                    'backgroundColor': '#F97316', # orange-500 (Cam)
                    'borderColor': '#EA580C',
                    'extendedProps': { 
                        'status': 'in_cart', 
                        'tour_id': c.tour.id,
                        'location_name': c.tour.location.name if c.tour.location else ''
                    }
                })
                
        return Response(events)

class AdminDashboardView(APIView):
    # Chỉ Admin (is_staff=True) mới được gọi API này
    permission_classes = [IsAdminUser]

    def get(self, request):
        total_users = User.objects.count()
        total_tours = Tour.objects.count()
        total_bookings = Booking.objects.count()

        # Tính tổng doanh thu từ các đơn hàng đã xác nhận
        confirmed_bookings = Booking.objects.filter(status='Confirmed')
        revenue = sum([booking.total_price for booking in confirmed_bookings])

        # Lấy 5 đơn hàng gần nhất
        recent_bookings = Booking.objects.order_by('-created_at')[:5]
        recent_data = [{
            'id': b.id,
            'user': b.user.username,
            'tour': b.tour.title,
            'date': b.date.strftime('%d/%m/%Y') if b.date else 'Chưa chọn',
            'status': b.status,
            'total': b.total_price
        } for b in recent_bookings]

        return Response({
            'total_users': total_users,
            'total_tours': total_tours,
            'total_bookings': total_bookings,
            'revenue': revenue,
            'recent_bookings': recent_data
        })