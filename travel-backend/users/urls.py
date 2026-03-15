from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView, TokenObtainPairView
from .views import RegisterView
from .serializers import MyTokenObtainPairSerializer # Import Serializer vừa tạo

# Khai báo một View mới ghi đè View cũ
class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', MyTokenObtainPairView.as_view(), name='login'), # Đổi thành MyTokenObtainPairView
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]