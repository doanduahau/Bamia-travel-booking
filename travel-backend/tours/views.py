from rest_framework import viewsets, filters
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.permissions import IsAuthenticatedOrReadOnly, AllowAny
from rest_framework.views import APIView
from rest_framework.response import Response
from django.conf import settings

from google import genai
from google.genai import types

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
        if not user_message:
            return Response({'error': 'Vui lòng nhập tin nhắn.'}, status=400)

        try:
            # 2. Khởi tạo Client theo chuẩn SDK mới
            client = genai.Client(api_key=settings.GEMINI_API_KEY)

            # 3. Cấu hình System Instruction (Chuẩn và chuyên nghiệp hơn)
            sys_instruct = (
                "Bạn là trợ lý ảo du lịch TravelBaMia thân thiện. "
                "Tư vấn lịch trình, gợi ý điểm đến bằng tiếng Việt. "
                "Trả lời ngắn gọn (<150 từ), dùng icon sinh động. "
                "Không bịa thông tin tour."
            )

            # 4. Gọi Model (Dùng gemini-2.5-flash cho tốc độ cực nhanh)
            response = client.models.generate_content(
                model="gemini-2.5-flash",
                contents=user_message,
                config=types.GenerateContentConfig(
                    system_instruction=sys_instruct,
                    temperature=0.7
                )
            )

            return Response({'reply': response.text})

        except Exception as e:
            # Trả về lỗi chi tiết hơn để dễ debug
            return Response({'error': f"AI Error: {str(e)}"}, status=500)