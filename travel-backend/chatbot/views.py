from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.views import APIView
from rest_framework.response import Response
from django.http import StreamingHttpResponse

import requests
import json
import time
import os

from tours.models import Tour, Destination

try:
    from bookings.models import Booking, Cart
except ImportError:
    Booking, Cart = None, None

OLLAMA_URL = "http://127.0.0.1:11434/api/chat"
OLLAMA_MODEL = os.environ.get('OLLAMA_MODEL', 'qwen2.5:1.5b')
OLLAMA_TIMEOUT_CONNECT = 5    # Giây chờ kết nối đến Ollama
OLLAMA_TIMEOUT_READ = 120     # Giây chờ đọc response (model có thể chậm)
OLLAMA_MAX_RETRIES = 2        # Số lần thử lại tối đa


class OllamaHealthView(APIView):
    """Kiểm tra Ollama có đang chạy không — không cần xác thực."""
    permission_classes = [AllowAny]

    def get(self, request):
        try:
            # Kiểm tra endpoint gốc của Ollama
            resp = requests.get(
                "http://127.0.0.1:11434/",
                timeout=(OLLAMA_TIMEOUT_CONNECT, 5)
            )
            if resp.status_code == 200:
                return Response({'status': 'ok', 'message': 'Ollama đang hoạt động.'})
            return Response({'status': 'error', 'message': 'Ollama phản hồi không hợp lệ.'}, status=503)
        except requests.exceptions.ConnectionError:
            return Response({'status': 'offline', 'message': 'Ollama chưa được khởi động.'}, status=503)
        except requests.exceptions.Timeout:
            return Response({'status': 'timeout', 'message': 'Ollama không phản hồi kịp thời.'}, status=503)


def _stream_ollama(ollama_messages):
    """Generator: gọi Ollama ở chế độ stream=True, yield từng chunk JSON."""
    payload = {
        "model": OLLAMA_MODEL,
        "messages": ollama_messages,
        "stream": True,
        "options": {
            "temperature": 0.6,     # Thấp hơn → ít ngẫu nhiên → nhanh hơn
            "num_predict": 512,     # Giới hạn độ dài → trả lời ngắn gọn & nhanh
            "num_ctx": 2048,        # Cửa sổ context nhỏ → xử lý nhanh hơn
            "top_k": 20,            # Chỉ chọn từ 20 token tốt nhất → sampling nhanh
            "top_p": 0.8,           # Nucleus sampling → giảm tính toán
            "repeat_last_n": 64,    # Lookback ngắn hơn → nhanh hơn
        }
    }
    # Model nghĩ ra được chữ nào thì hiện ra chữ đó
    with requests.post(
        OLLAMA_URL,
        json=payload,
        stream=True,
        timeout=(OLLAMA_TIMEOUT_CONNECT, OLLAMA_TIMEOUT_READ)
    ) as resp:
        resp.raise_for_status()
        for line in resp.iter_lines():
            if line:
                try:
                    chunk = json.loads(line)
                    token = chunk.get("message", {}).get("content", "")
                    done = chunk.get("done", False)
                    yield json.dumps({"token": token, "done": done}, ensure_ascii=False) + "\n" #yield từng chữ
                    if done:
                        break
                except json.JSONDecodeError:
                    continue


class ChatbotAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user_message = request.data.get('message', '').strip()
        system_instruction = request.data.get('system_instruction', '')
        history = request.data.get('history', [])
        use_stream = request.data.get('stream', True)
        # Danh sách địa điểm đã được cache ở Frontend (tên lowercase)
        loaded_destinations = [d.lower() for d in request.data.get('loaded_destinations', [])]

        if not user_message:
            return Response({'error': 'Vui lòng nhập tin nhắn.'}, status=400)

        # Kiểm tra an ninh cơ bản
        security_keywords = ['database', 'password', 'mật khẩu', 'cấu trúc sql', 'select *', 'delete from', 'drop table', 'backend code']
        if any(kw in user_message.lower() for kw in security_keywords):
            safe_reply = 'Xin lỗi, tôi không thể hỗ trợ các thông tin liên quan đến kỹ thuật hoặc bảo mật hệ thống. 🙏'
            if use_stream:
                def safe_gen():
                    yield json.dumps({"token": safe_reply, "done": True}, ensure_ascii=False) + "\n"
                return StreamingHttpResponse(safe_gen(), content_type='text/event-stream; charset=utf-8')
            return Response({'reply': safe_reply})

        # --- LOGIC RAG: Tìm kiếm dữ liệu khớp ---
        destinations = Destination.objects.exclude(info_file__isnull=True).exclude(info_file='')
        rag_context = ""
        msg_lower = user_message.lower()

        # Bước 1: Quét xem người dùng có nhắc trực tiếp địa danh nào trong tin nhắn hiện tại không
        direct_matches = []
        for dest in destinations:
            match_found = False
            # Kiểm tra tên địa danh
            if dest.name.lower() in msg_lower:
                match_found = True
            # Kiểm tra từ khóa
            elif dest.keywords:
                kw_list = [k.strip().lower() for k in dest.keywords.split(',') if k.strip()]
                for kw in kw_list:
                    if kw and kw in msg_lower:
                        match_found = True
                        break
            if match_found:
                direct_matches.append(dest)

        # Bước 2: Quyết định danh sách địa điểm sẽ nạp dữ liệu
        matched_destinations_to_load = []
        if len(direct_matches) > 0:
            # Người dùng chủ động nhắc địa danh mới -> ghi đè, xóa sạch cache cũ để tránh tràn context
            matched_destinations_to_load = direct_matches
        else:
            # Hỏi nối tiếp không nhắc tên -> Kích hoạt cache cũ từ loaded_destinations
            for dest in destinations:
                if dest.name.lower() in loaded_destinations:
                    matched_destinations_to_load.append(dest)

        matched_dest_names = [dest.name for dest in matched_destinations_to_load]

        # Bước 3: Đọc file dữ liệu của các địa điểm được chọn
        for dest in matched_destinations_to_load:

            # Đọc dữ liệu file thực tế (BẮT BUỘC phải đọc để gửi kèm Prompt vì LLM stateless)
            try:
                file_path = dest.info_file.path
                if os.path.exists(file_path):
                    print(f"[RAG] Đọc dữ liệu ngữ cảnh cho: {dest.name} -> {file_path}")
                    with open(file_path, 'r', encoding='utf-8') as f:
                        content = f.read()
                    # Trim nội dung tối đa 3000 ký tự để tránh context quá lớn
                    if len(content) > 3000:
                        content = content[:3000] + "\n...(còn tiếp)"
                    rag_context += f"\n\n=== DỮ LIỆU ĐỊA ĐIỂM: {dest.name} ===\n{content}\n"
                else:
                    print(f"[RAG] File không tồn tại: {file_path}")
            except Exception as e:
                print(f"[RAG] Lỗi đọc file {dest.name}: {e}")

        # Nếu system_instruction trống hoặc không chứa danh sách tour, dựng lại prompt trực tiếp từ Database ở Backend!
        if not system_instruction or "=== DANH SÁCH TOUR ĐANG CÓ ===" not in system_instruction:
            print("[Chatbot] Khởi động bộ dựng System Prompt dự phòng tại Backend...")
            tours = Tour.objects.all()
            tours_text = "\n<DANH_SACH_TOUR>\n"
            if not tours.exists():
                tours_text += "Hiện chưa có tour nào.\n"
            else:
                for t in tours:
                    loc = t.location.name if t.location else "N/A"
                    tours_text += f"• Tên tour: {t.title} | Địa điểm: {loc} | ID: {t.id}\n"
            tours_text += "</DANH_SACH_TOUR>\n"

            bookings_text = ""
            cart_text = ""
            user_status_text = "=== TRẠNG THÁI NGƯỜI DÙNG ===\n"

            # Sử dụng request.user (được thiết lập do permission_classes = [IsAuthenticated])
            if request.user and request.user.is_authenticated:
                user_status_text += f"• Trạng thái: ĐÃ ĐĂNG NHẬP\n• Tên tài khoản: {request.user.username}\n• Email: {request.user.email}\n"

                # Nạp lịch sử đặt hàng
                if Booking:
                    bookings = Booking.objects.filter(user=request.user)
                    bookings_text = f"\n=== ĐƠN HÀNG CỦA {request.user.username.upper()} ===\n"
                    if not bookings.exists():
                        bookings_text += "Khách hiện chưa có đơn hàng nào trong lịch sử.\n"
                    else:
                        for b in bookings:
                            tour_title = b.tour.title if b.tour else "N/A"
                            bookings_text += (
                                f"\n• Đơn #{b.id}: {tour_title}\n"
                                f"  Ngày đi: {b.date} | Số người: {b.number_of_people}\n"
                                f"  Tổng tiền: {int(b.total_price):,} VNĐ | Trạng thái: {b.status}\n"
                            )

                # Nạp giỏ hàng
                if Cart:
                    cart_items = Cart.objects.filter(user=request.user)
                    cart_text = f"\n=== GIỎ HÀNG CỦA {request.user.username.upper()} (Chưa thanh toán) ===\n"
                    if not cart_items.exists():
                        cart_text += "Giỏ hàng hiện đang trống.\n"
                    else:
                        for item in cart_items:
                            tour_title = item.tour.title if item.tour else "N/A"
                            cart_text += (
                                f"\n• [ID:{item.id}] {tour_title}\n"
                                f"  Ngày dự kiến: {item.date or 'Chưa chọn'} | Số người: {item.number_of_people}\n"
                                f"  Đơn giá: {int(item.tour.price):,} VNĐ | Thành tiền: {int(item.tour.price * item.number_of_people):,} VNĐ\n"
                            )
                        cart_text += "\nLưu ý: Đây là những tour khách đã thêm vào giỏ nhưng chưa thanh toán. Hãy khuyến khích họ đặt tour nếu họ đang phân vân.\n"
            else:
                user_status_text += "• Trạng thái: CHƯA ĐĂNG NHẬP (Khách vãng lai)\n• Quyền: Chỉ được xem tour, không có quyền truy cập thông tin cá nhân hay đơn hàng.\n"

            # Bản sao quy tắc hệ thống chuẩn của ChatbotUtils
            system_instruction = (
                "Bạn là AI trợ lý du lịch của TravelBaMia.\n"
                "Nhiệm vụ của bạn là trả lời khách hàng cực kỳ NGẮN GỌN, ĐI THẲNG VÀO Ý CHÍNH, KHÔNG VÒNG VO.\n\n"
                "=== QUY TẮC BẮT BUỘC ===\n"
                "1. Khách hỏi CÓ TOUR NÀO: CHỈ ĐƯỢC PHÉP đọc TÊN của các tour nằm trong phần <DANH_SACH_TOUR> bên dưới. Tuyệt đối không tự sáng tác tour. Liệt kê tối đa 3 tour, mỗi tour một dòng.\n"
                "2. Cuối tên mỗi tour BẮT BUỘC gắn nhãn [TOUR_CARD:ID] (Ví dụ: 'Tour Đà Lạt [TOUR_CARD:1]'). KHÔNG giải thích, KHÔNG ghi giá hay thời gian.\n"
                "3. Khách yêu cầu XEM CHI TIẾT / ĐẶT VÉ: Bắt buộc đồng ý và gửi [TOUR_CARD:ID]. Không được từ chối.\n\n"
                "=== QUY TẮC VỀ ĐỊA CHỈ & THÔNG TIN CÔNG CỘNG (QUAN TRỌNG) ===\n"
                "1. Khi khách hàng hỏi về địa chỉ, thông tin cụ thể của các quán ăn, nhà hàng, khách sạn, danh lam thắng cảnh trong 'DỮ LIỆU ĐỊA ĐIỂM', bạn HOÀN TOÀN ĐƯỢC PHÉP và BẮT BUỘC phải cung cấp chính xác địa chỉ của chúng từ file tài liệu.\n"
                "2. Tuyệt đối KHÔNG ĐƯỢC từ chối trả lời địa chỉ của các quán ăn, nhà hàng với lý do 'bảo mật' hay 'không được niêm phong' hay 'thông tin riêng tư/nhạy cảm'. Đó là thông tin du lịch công cộng hữu ích!\n\n"
                "=== QUY TẮC XƯNG HÔ & BẢO MẬT (QUAN TRỌNG) ===\n"
                "1. Kiểm tra mục 'TRẠNG THÁI NGƯỜI DÙNG' bên dưới để biết thông tin khách hàng.\n"
                "2. Khi trạng thái là 'ĐÃ ĐĂNG NHẬP':\n"
                "   - Bạn HOÀN TOÀN có quyền đọc và sử dụng tên tài khoản (username) hoặc email của họ.\n"
                "   - LUÔN LUÔN chào hỏi và gọi họ bằng tên tài khoản của họ. Tuyệt đối KHÔNG ĐƯỢC từ chối và nói 'Tôi không có quyền truy cập thông tin cá nhân' khi họ hỏi tên của họ!\n"
                "3. Khi trạng thái là 'CHƯA ĐĂNG NHẬP':\n"
                "   - Yêu cầu họ đăng nhập để hỗ trợ các thông tin cá nhân hoặc giỏ hàng.\n\n"
                "=== QUY TẮC CẤT GIẢM ĐỘ DÀI (BẮT BUỘC) ===\n"
                "1. Trả lời ngay lập tức trọng tâm câu hỏi. KHÔNG có phần dẫn dắt dài dòng, không dùng từ thừa.\n"
                "2. Giới hạn câu trả lời trong khoảng 2 - 4 câu ngắn hoặc danh sách tối đa 3 - 4 gạch đầu dòng.\n"
                "3. KHÔNG chào hỏi lặp đi lặp lại dài dòng. Chỉ cần chào rất ngắn ở câu đầu tiên (ví dụ: 'Chào bạn, ...'), các câu sau đi thẳng vào trả lời.\n"
                "4. KHÔNG viết kết luận, cảm ơn hay lời chúc sáo rỗng dài dòng ở cuối mỗi tin nhắn.\n\n"
                "=== QUY TẮC TRÌNH BÀY ===\n"
                "1. LUÔN LUÔN trình bày thông tin theo dạng gạch đầu dòng (•) súc tích để khách hàng dễ đọc lướt nhanh.\n"
                "2. Mỗi gạch đầu dòng chỉ dài tối đa 1 dòng. Tránh các đoạn văn dài.\n\n"
                "=== QUY TẮC CẤM (TUYỆT ĐỐI) ===\n"
                "1. TUYỆT ĐỐI KHÔNG dùng nhãn [TASK_COMPLETE], [DONE], [SUCCESS]... trong câu trả lời.\n"
                "2. CHỈ dùng [TOUR_CARD:ID] hoặc [ESCALATE] khi thật sự cần thiết.\n"
                "3. Không trả lời về technical (mã nguồn, database, hoặc các vấn đề kỹ thuật khác).\n\n"
                f"{user_status_text}{tours_text}{bookings_text}{cart_text}"
            )

        # --- Chuẩn bị messages cho Ollama ---
        ollama_messages = []

        # 1. System Prompt
        ollama_messages.append({"role": "system", "content": system_instruction})

        # 2. History (giữ 10 tin nhắn gần nhất theo yêu cầu)
        for msg in history[-10:]:
            role = msg.get("role", "user")
            content = msg.get("content", "")
            if role in ("user", "assistant") and content:
                ollama_messages.append({"role": role, "content": content})

        # 3. User message + RAG context mới (nếu có)
        final_user_message = user_message
        if rag_context:
            final_user_message = (
                f"Dựa trên dữ liệu chính thức sau đây:\n{rag_context}\n\n"
                f"Hãy trả lời câu hỏi: {user_message}\n"
                f"(Yêu cầu: Lịch sự, tập trung ý chính, ngắn gọn, tiếng Việt)"
            )

        ollama_messages.append({"role": "user", "content": final_user_message})

        # --- CHẾ ĐỘ STREAMING ---
        if use_stream:
            def stream_with_retry():
                for attempt in range(OLLAMA_MAX_RETRIES + 1):
                    try:
                        yield from _stream_ollama(ollama_messages)
                        # Sau khi stream xong → gửi meta chunk để Frontend cập nhật cache
                        yield json.dumps({
                            "meta": True,
                            "matched_destinations": matched_dest_names
                        }, ensure_ascii=False) + "\n"
                        return
                    except requests.exceptions.ConnectionError:
                        if attempt < OLLAMA_MAX_RETRIES:
                            time.sleep(1)
                            continue
                        error_msg = "⚠️ Không thể kết nối đến AI. Vui lòng đảm bảo Ollama đang chạy."
                        yield json.dumps({"token": error_msg, "done": True, "error": "connection"}, ensure_ascii=False) + "\n"
                    except Exception as e:
                        yield json.dumps({"token": f"❌ Lỗi: {str(e)}", "done": True, "error": "unknown"}, ensure_ascii=False) + "\n"
                    return

            response = StreamingHttpResponse(stream_with_retry(), content_type='text/event-stream; charset=utf-8')
            response['Cache-Control'] = 'no-cache'
            response['X-Accel-Buffering'] = 'no'
            return response

        # --- CHẾ ĐỘ KHÔNG STREAMING (fallback) ---
        try:
            payload = {
                "model": OLLAMA_MODEL,
                "messages": ollama_messages,
                "stream": False,
                "options": {"temperature": 0.7, "num_predict": 1024}
            }
            resp = requests.post(OLLAMA_URL, json=payload, timeout=(OLLAMA_TIMEOUT_CONNECT, OLLAMA_TIMEOUT_READ))
            resp.raise_for_status()
            return Response({'reply': resp.json().get('message', {}).get('content', '')})
        except Exception as e:
            return Response({'error': str(e)}, status=500)
