class ChatbotAPIView(APIView):
    permission_classes = [AllowAny]

    def _build_tours_context(self):
        """Lấy tất cả tour từ DB và chuyển thành text context cho AI."""
        tours = Tour.objects.select_related('location', 'category').filter(available_slots__gt=0)
        tours_data = TourSerializer(tours, many=True).data

        if not tours_data:
            return "Hiện tại chưa có tour nào khả dụng."

        lines = ["=== DANH SÁCH TOUR ĐANG CÓ ==="]
        for t in tours_data:
            loc = (t.get('location_detail') or {}).get('name', 'N/A')
            cat = (t.get('category_detail') or {}).get('name', 'N/A')
            lines.append(
                f"\n• [{t['id']}] {t['title']}"
                f"\n  Địa điểm: {loc} | Danh mục: {cat}"
                f"\n  Giá: {t['price']} VNĐ/người | Thời gian: {t['duration']}"
                f"\n  Đánh giá: {t['rating']}/5 | Còn chỗ: {t['available_slots']} slot"
                f"\n  Mô tả: {str(t['description'])[:150]}..."
            )
        return "\n".join(lines)

    def _build_bookings_context(self, user):
        """Lấy booking của user hiện tại (nếu đã đăng nhập)."""
        from bookings.models import Booking
        from bookings.serializers import BookingSerializer

        bookings = Booking.objects.filter(
            user=user,
            deleted_at__isnull=True
        ).exclude(status='Cancelled').select_related('tour')

        if not bookings.exists():
            return f"\n=== ĐƠN HÀNG CỦA {user.username.upper()} ===\nChưa có đơn hàng nào."

        data = BookingSerializer(bookings, many=True).data
        lines = [f"\n=== ĐƠN HÀNG CỦA {user.username.upper()} ==="]
        for b in data:
            tour_title = (b.get('tour_detail') or {}).get('title', 'N/A')
            lines.append(
                f"\n• Đơn #{b['id']}: {tour_title}"
                f"\n  Ngày đi: {b['date']} | Số người: {b['number_of_people']}"
                f"\n  Tổng tiền: {b['total_price']} VNĐ | Trạng thái: {b['status']}"
            )
        return "\n".join(lines)

    def post(self, request):
        user_message = request.data.get('message', '')
        # Lịch sử hội thoại gửi từ frontend [{text, isBot}, ...]
        history = request.data.get('history', [])

        if not user_message:
            return Response({'error': 'Vui lòng nhập tin nhắn.'}, status=400)

        try:
            # 1. Lấy dữ liệu thực từ DB
            tours_context = self._build_tours_context()
            bookings_context = ""
            if request.user.is_authenticated:
                bookings_context = self._build_bookings_context(request.user)

            # 2. Xây dựng system prompt với context thực
            sys_instruct = f"""Bạn là trợ lý ảo du lịch TravelBaMia, thân thiện và chuyên nghiệp.
Nhiệm vụ: Tư vấn tour, hỗ trợ đặt lịch, trả lời thắc mắc về du lịch.
Ngôn ngữ: Tiếng Việt, dùng emoji sinh động.
Giới hạn: Dưới 200 từ/câu trả lời. Chỉ tư vấn dựa trên dữ liệu thực bên dưới, KHÔNG bịa thêm tour.
Khi khách muốn đặt tour: Hướng dẫn vào mục "Tours" trên website để đặt trực tiếp.

{tours_context}
{bookings_context}
"""

            # 3. Khởi tạo Gemini client
            client = genai.Client(api_key=settings.GEMINI_API_KEY)

            # 4. Build multi-turn conversation (tối đa 10 tin nhắn gần nhất)
            contents = []
            for msg in history[-10:]:
                role = "model" if msg.get('isBot') else "user"
                contents.append(
                    types.Content(role=role, parts=[types.Part(text=msg['text'])])
                )
            # Thêm tin nhắn hiện tại
            contents.append(
                types.Content(role="user", parts=[types.Part(text=user_message)])
            )

            # 5. Gọi Gemini
            response = client.models.generate_content(
                model="gemini-2.5-flash",
                contents=contents,
                config=types.GenerateContentConfig(
                    system_instruction=sys_instruct,
                    temperature=0.7
                )
            )

            return Response({'reply': response.text})

        except Exception as e:
            return Response({'error': f"AI Error: {str(e)}"}, status=500)