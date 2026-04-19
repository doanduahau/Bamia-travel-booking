from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework.routers import DefaultRouter

from tours.views import TourViewSet, DestinationViewSet, CategoryViewSet, ChatbotAPIView
from bookings.views import BookingViewSet, CartViewSet
from reviews.views import ReviewViewSet
from bookings.views import BookingViewSet, CartViewSet, MyItineraryView, AdminDashboardView

# Khởi tạo Router tự động sinh API endpoint
router = DefaultRouter()
router.register(r'categories', CategoryViewSet, basename='category')
router.register(r'tours', TourViewSet, basename='tour')
router.register(r'cart', CartViewSet, basename='cart')
router.register(r'destinations', DestinationViewSet, basename='destination')
router.register(r'bookings', BookingViewSet, basename='booking')
router.register(r'reviews', ReviewViewSet, basename='review')

from django.views.generic import RedirectView
from core.views import (
    CustomAdminLoginView, CustomAdminDashboardView, AdminTourListView, AdminTourDeleteView,
    AdminTourCreateView, AdminTourUpdateView,
    AdminBookingListView, admin_change_booking_status, AdminReviewListView, AdminReviewDeleteView,
    AdminForgotPasswordView, AdminUserListView, AdminUserUpdateView, AdminSupportRequestListView, admin_complete_support_request, admin_reset_user_password, admin_toggle_user_status
)
from django.contrib.auth.views import LogoutView

urlpatterns = [
    path('', RedirectView.as_view(url='/api/', permanent=False)),
    path('admin/login/', CustomAdminLoginView.as_view(), name='admin_login'),
    path('admin/forgot-password/', AdminForgotPasswordView.as_view(), name='admin_forgot_password'),
    path('admin/logout/', LogoutView.as_view(next_page='admin_login'), name='admin_logout'),
    path('admin/', CustomAdminDashboardView.as_view(), name='custom_admin_dashboard'),
    
    # Custom Admin CRUD routes
    path('admin/tours/', AdminTourListView.as_view(), name='admin_tours'),
    path('admin/tours/add/', AdminTourCreateView.as_view(), name='admin_tour_create'),
    path('admin/tours/<int:pk>/edit/', AdminTourUpdateView.as_view(), name='admin_tour_edit'),
    path('admin/tours/<int:pk>/delete/', AdminTourDeleteView.as_view(), name='admin_tour_delete'),
    
    path('admin/bookings/', AdminBookingListView.as_view(), name='admin_bookings'),
    path('admin/bookings/<int:pk>/status/', admin_change_booking_status, name='admin_change_booking_status'),
    
    path('admin/reviews/', AdminReviewListView.as_view(), name='admin_reviews'),
    path('admin/reviews/<int:pk>/delete/', AdminReviewDeleteView.as_view(), name='admin_review_delete'),
    
    path('admin/users/', AdminUserListView.as_view(), name='admin_users'),
    path('admin/users/<int:pk>/edit/', AdminUserUpdateView.as_view(), name='admin_user_edit'),
    path('admin/users/<int:user_id>/reset-password/', admin_reset_user_password, name='admin_reset_user_password'),
    path('admin/users/<int:user_id>/toggle-status/', admin_toggle_user_status, name='admin_toggle_user_status'),
    
    path('admin/requests/', AdminSupportRequestListView.as_view(), name='admin_requests'),
    path('admin/requests/<int:pk>/complete/', admin_complete_support_request, name='admin_complete_support_request'),
    
    path('api/auth/', include('users.urls')), # Chuyển đăng ký/đăng nhập vào group auth/
    path('api/chat/', ChatbotAPIView.as_view(), name='ai-chat'),
    path('api/', include(router.urls)),       # Toàn bộ API CRUD sẽ nằm ở đây
    path('api/my-itinerary/', MyItineraryView.as_view(), name='my-itinerary'),
    path('api/admin-dashboard/', AdminDashboardView.as_view(), name='admin-dashboard'),
    path('api/payments/', include('payments.urls')),
]

# Phục vụ file media (ảnh upload) trong môi trường development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)