from rest_framework import generics
from django.contrib.auth.models import User
from .serializers import RegisterSerializer, SupportRequestSerializer, UserUpdateSerializer, ChangePasswordSerializer
from rest_framework.permissions import AllowAny, IsAuthenticated

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.core.mail import send_mail
from django.conf import settings
from django.utils.crypto import get_random_string
from .models import SupportRequest

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (AllowAny,)
    serializer_class = RegisterSerializer

class ForgotPasswordView(APIView):
    permission_classes = (AllowAny,)

    def post(self, request):
        email = request.data.get('email')
        if not email:
            return Response({"error": "Vui lòng nhập email"}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            user = User.objects.get(email=email)
            # Tạo mật khẩu ngẫu nhiên mới
            new_password = get_random_string(length=10)
            user.set_password(new_password)
            user.save()

            # Gửi email
            subject = 'Khôi phục mật khẩu TravelBaMia'
            message = f'Chào {user.username},\n\nMật khẩu mới của bạn là: {new_password}\n\nVui lòng đăng nhập và đổi mật khẩu ngay sau đó để bảo mật tài khoản.\n\nTrân trọng,\nĐội ngũ TravelBaMia'
            email_from = settings.DEFAULT_FROM_EMAIL
            recipient_list = [email]
            
            send_mail(subject, message, email_from, recipient_list)

            # Create Support Request record
            SupportRequest.objects.create(
                user=user,
                request_type='FORGOT_PASSWORD',
                content=f"Yêu cầu khôi phục mật khẩu từ trang Login. Mật khẩu mới đã được gửi: {new_password}",
                status='PROCESSING'
            )

            return Response({"success": "Mật khẩu mới đã được gửi về email của bạn!"}, status=status.HTTP_200_OK)
        except User.DoesNotExist:
            return Response({"error": "Không tìm thấy người dùng với email này"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class SupportRequestCreateView(generics.CreateAPIView):
    queryset = SupportRequest.objects.all()
    serializer_class = SupportRequestSerializer
    permission_classes = (AllowAny,)

    def perform_create(self, serializer):
        if self.request.user.is_authenticated:
            serializer.save(user=self.request.user)
        else:
            serializer.save()

class UserProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserUpdateSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user

class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            user = request.user
            user.set_password(serializer.validated_data['new_password'])
            user.save()
            return Response({"success": "Đổi mật khẩu thành công!"}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)