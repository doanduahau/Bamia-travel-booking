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
OLLAMA_MODEL = os.environ.get('OLLAMA_MODEL', 'qwen2.5:7b')
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
            "temperature": 0.1,     # Thấp (0.1) → cực kỳ rập khuôn, bám sát luật để không quên TOUR_CARD
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
        if not system_instruction or "<DANH_SACH_TOUR>" not in system_instruction:
            print("[Chatbot] Khởi động bộ dựng System Prompt dự phòng tại Backend...")
            tours = Tour.objects.all()
            tours_text = "\n<DANH_SACH_TOUR>\n"
            if not tours.exists():
                tours_text += "Hiện chưa có tour nào.\n"
            else:
                for t in tours:
                    loc = t.location.name if t.location else "N/A"
                    tours_text += f'<TOUR id="{t.id}" ten="{t.title}" dia_diem="{loc}" />\n'
            tours_text += "</DANH_SACH_TOUR>\n"

            # Bản sao quy tắc hệ thống chuẩn của ChatbotUtils
            system_instruction = (
                "Bạn là AI trợ lý du lịch của TravelBaMia.\n"
                "Nhiệm vụ của bạn là trả lời khách hàng cực kỳ NGẮN GỌN, ĐI THẲNG VÀO Ý CHÍNH, KHÔNG VÒNG VO.\n\n"
                "=== QUY TẮC BẮT BUỘC ===\n"
                "1. Khi khách chỉ chào hỏi: CHỈ ĐƯỢC PHÉP chào lại bằng 1 câu. TUYỆT ĐỐI KHÔNG đọc danh sách tour.\n"
                "2. Khách hỏi DANH SÁCH TOUR (VD: 'Có tour nào không?', 'Tour Nha Trang'): CHỈ liệt kê thuộc tính 'ten' của các <TOUR> bằng gạch đầu dòng. TUYỆT ĐỐI KHÔNG in ra 'id'. KHÔNG dùng thẻ [TOUR_CARD].\n"
                "3. Khách YÊU CẦU XEM CHI TIẾT (VD: 'cho tôi thông tin tour Fansipan'): Bắt buộc gọi tên tour và GẮN THẺ [TOUR_CARD:id] (Lấy id từ thuộc tính 'id' của thẻ <TOUR>). KHÔNG giải thích dài dòng.\n\n"
                "=== VÍ DỤ CÁCH TRẢ LỜI (HÃY BẮT CHƯỚC Y HỆT) ===\n"
                "Khách: 'Có tour Sa Pa nào không?'\n"
                "AI: 'Bên mình có các tour Sa Pa sau:\n"
                "• Khám Phá Bản Cát Cát\n"
                "• Chinh Phục Đỉnh Fansipan'\n\n"
                "Khách: 'Cho tôi xem chi tiết tour Cát Cát'\n"
                "AI: 'Dạ đây là thông tin chi tiết của tour bạn yêu cầu: Khám Phá Bản Cát Cát [TOUR_CARD:3]'\n\n"
                "=== QUY TẮC VỀ ĐỊA CHỈ & THÔNG TIN CÔNG CỘNG (QUAN TRỌNG) ===\n"
                "1. Khi khách hàng hỏi về địa chỉ, thông tin cụ thể của các quán ăn, nhà hàng, khách sạn, danh lam thắng cảnh trong 'DỮ LIỆU ĐỊA ĐIỂM', bạn HOÀN TOÀN ĐƯỢC PHÉP và BẮT BUỘC phải cung cấp chính xác địa chỉ của chúng từ file tài liệu.\n"
                "2. Tuyệt đối KHÔNG ĐƯỢC từ chối trả lời địa chỉ của các quán ăn, nhà hàng với lý do 'bảo mật' hay 'không được niêm phong' hay 'thông tin riêng tư/nhạy cảm'. Đó là thông tin du lịch công cộng hữu ích!\n\n"
                "=== QUY TẮC CẤM (TUYỆT ĐỐI) ===\n"
                "1. TUYỆT ĐỐI KHÔNG dùng nhãn [TASK_COMPLETE], [DONE], [SUCCESS]... trong câu trả lời.\n"
                "2. Không trả lời về technical (mã nguồn, database, hoặc các vấn đề kỹ thuật khác).\n\n"
                f"{tours_text}"
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

        final_user_message = user_message
        if rag_context:
            # Trích xuất danh sách tour từ system_instruction để nhét vào user_message (chống recency bias của model nhỏ)
            tours_in_system = ""
            start_idx = system_instruction.find("<DANH_SACH_TOUR>")
            end_idx = system_instruction.find("</DANH_SACH_TOUR>")
            if start_idx != -1 and end_idx != -1:
                tours_in_system = system_instruction[start_idx:end_idx + len("</DANH_SACH_TOUR>")]
                
            final_user_message = (
                f"1. THÔNG TIN ĐỊA ĐIỂM (Không phải tour):\n{rag_context}\n\n"
                f"2. DANH SÁCH TOUR TRONG HỆ THỐNG:\n{tours_in_system}\n\n"
                f"CÂU HỎI CỦA KHÁCH: {user_message}\n\n"
                f"(Gợi ý cho AI: Nếu khách hỏi tour, HÃY TÌM TRONG DANH SÁCH TOUR TRONG HỆ THỐNG. KHÔNG lấy thông tin địa điểm làm tour. Tuân thủ định dạng thẻ [TOUR_CARD:ID] ở Quy tắc Bắt buộc.)"
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
                "options": {"temperature": 0.1, "num_predict": 1024}
            }
            resp = requests.post(OLLAMA_URL, json=payload, timeout=(OLLAMA_TIMEOUT_CONNECT, OLLAMA_TIMEOUT_READ))
            resp.raise_for_status()
            return Response({'reply': resp.json().get('message', {}).get('content', '')})
        except Exception as e:
            return Response({'error': str(e)}, status=500)
