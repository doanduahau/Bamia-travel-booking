from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework.routers import DefaultRouter

from tours.views import TourViewSet, DestinationViewSet, ChatbotAPIView
from bookings.views import BookingViewSet, CartViewSet
from reviews.views import ReviewViewSet
from bookings.views import BookingViewSet, CartViewSet, MyItineraryView, AdminDashboardView

# Khởi tạo Router tự động sinh API endpoint
router = DefaultRouter()
router.register(r'tours', TourViewSet, basename='tour')
router.register(r'destinations', DestinationViewSet, basename='destination')
router.register(r'bookings', BookingViewSet, basename='booking')
router.register(r'reviews', ReviewViewSet, basename='review')
router.register(r'cart', CartViewSet, basename='cart')

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('users.urls')), # Chuyển đăng ký/đăng nhập vào group auth/
    path('api/chat/', ChatbotAPIView.as_view(), name='ai-chat'),
    path('api/', include(router.urls)),       # Toàn bộ API CRUD sẽ nằm ở đây
    path('api/my-itinerary/', MyItineraryView.as_view(), name='my-itinerary'),
    path('api/admin-dashboard/', AdminDashboardView.as_view(), name='admin-dashboard'),
]

# Phục vụ file media (ảnh upload) trong môi trường development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)