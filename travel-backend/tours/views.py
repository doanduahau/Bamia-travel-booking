from rest_framework import viewsets, filters
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.permissions import IsAuthenticatedOrReadOnly, AllowAny
from rest_framework.views import APIView
from rest_framework.response import Response
from django.conf import settings

import requests

from .models import Tour, Destination, Category
from .serializers import TourSerializer, DestinationSerializer, CategorySerializer

class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

class DestinationViewSet(viewsets.ModelViewSet):
    queryset = Destination.objects.all()
    serializer_class = DestinationSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]


class TourViewSet(viewsets.ModelViewSet):
    queryset = Tour.objects.all()
    serializer_class = TourSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['location', 'duration']
    search_fields = ['title', 'description']
    ordering_fields = ['price', 'rating', 'created_at']


class ChatbotAPIView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        user_message = request.data.get('message', '')
        system_instruction = request.data.get('system_instruction', '')
        history = request.data.get('history', [])

        if not user_message:
            return Response({'error': 'Vui lòng nhập tin nhắn.'}, status=400)

        # 1. Kiểm tra an ninh cơ bản tại Backend (Server-side security)
        security_keywords = ['database', 'password', 'mật khẩu', 'cấu trúc sql', 'select *', 'delete from', 'drop table', 'hệ thống', 'backend code']
        if any(kw in user_message.lower() for kw in security_keywords):
            return Response({'reply': 'Xin lỗi, tôi không thể hỗ trợ các thông tin liên quan đến kỹ thuật hoặc bảo mật hệ thống. 🙏'})

        try:
            # 2. Chuẩn bị messages cho Ollama
            ollama_messages = []
            if system_instruction:
                ollama_messages.append({"role": "system", "content": system_instruction})
            
            # Thêm lịch sử hội thoại
            for msg in history:
                ollama_messages.append({"role": msg.get("role", "user"), "content": msg.get("content", "")})
            
            # Thêm tin nhắn hiện tại
            ollama_messages.append({"role": "user", "content": user_message})

            # 3. Gọi Ollama API
            ollama_url = "http://localhost:11434/api/chat"
            payload = {
                "model": "qwen2.5",
                "messages": ollama_messages,
                "stream": False,
                "options": {
                    "temperature": 0.7
                }
            }

            response = requests.post(ollama_url, json=payload, timeout=60)
            response.raise_for_status()
            
            data = response.json()
            reply_text = data.get('message', {}).get('content', '')

            return Response({'reply': reply_text})

        except requests.exceptions.RequestException as e:
            return Response({'error': f"Lỗi kết nối đến Ollama local: {str(e)}"}, status=500)
        except Exception as e:
            return Response({'error': f"AI Error: {str(e)}"}, status=500)