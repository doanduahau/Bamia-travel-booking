from rest_framework import viewsets, filters
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from .models import Tour, Destination
from .serializers import TourSerializer, DestinationSerializer
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
import google.generativeai as genai
from django.conf import settings
class DestinationViewSet(viewsets.ModelViewSet):
    queryset = Destination.objects.all()
    serializer_class = DestinationSerializer
    permission_classes = [IsAuthenticatedOrReadOnly] # Ai cũng xem được, có token mới thêm/sửa được

class TourViewSet(viewsets.ModelViewSet):
    queryset = Tour.objects.all()
    serializer_class = TourSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    
    # Cấu hình tính năng Search và Filter
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['location', 'duration'] # Lọc chính xác
    search_fields = ['title', 'description'] # Tìm kiếm từ khóa (Search bar)
    ordering_fields = ['price', 'rating', 'created_at'] # Sắp xếp
class ChatbotAPIView(APIView):
    permission_classes = [AllowAny] # Ai cũng có thể chat, không cần đăng nhập

    def post(self, request):
        user_message = request.data.get('message', '')
        if not user_message:
            return Response({'error': 'Vui lòng nhập tin nhắn.'}, status=400)

        try:
            # Cấu hình API Key
            genai.configure(api_key=settings.GEMINI_API_KEY)
            
            # Sử dụng model Gemini 1.5 Flash (nhanh và phù hợp cho chat)
            model = genai.GenerativeModel('gemini-2.5-flash')
            
            # Tạo Prompt hệ thống để định hình "nhân cách" cho AI
            system_prompt = f"""
            Bạn là một trợ lý ảo du lịch cực kỳ thân thiện, chuyên nghiệp của website đặt tour TravelBaMia.
            Nhiệm vụ của bạn là tư vấn lịch trình, gợi ý điểm đến, và giải đáp thắc mắc về du lịch cho khách hàng.
            Hãy trả lời bằng tiếng Việt, ngắn gọn, súc tích (dưới 150 chữ), dùng icon cho sinh động.
            Tuyệt đối không bịa ra các tour không có thật, nếu không biết hãy khuyên khách hàng xem trên website.
            
            Khách hàng hỏi: "{user_message}"
            """
            
            response = model.generate_content(system_prompt)
            return Response({'reply': response.text})
            
        except Exception as e:
            return Response({'error': str(e)}, status=500)