from rest_framework import viewsets, filters
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.permissions import IsAuthenticatedOrReadOnly, AllowAny, IsAuthenticated
from rest_framework.views import APIView
from rest_framework.response import Response
from django.http import StreamingHttpResponse

import requests
import json
import time
import os

from .models import Tour, Destination, Category
from .serializers import TourSerializer, DestinationSerializer, CategorySerializer

OLLAMA_URL = "http://127.0.0.1:11434/api/chat"
OLLAMA_MODEL = "qwen2.5"
OLLAMA_TIMEOUT_CONNECT = 5    # Giây chờ kết nối đến Ollama
OLLAMA_TIMEOUT_READ = 120     # Giây chờ đọc response (model có thể chậm)
OLLAMA_MAX_RETRIES = 2        # Số lần thử lại tối đa


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
                    yield json.dumps({"token": token, "done": done}, ensure_ascii=False) + "\n"
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

        # --- LOGIC RAG: Cache thông minh theo phiên ---
        destinations = Destination.objects.exclude(info_file__isnull=True).exclude(info_file='')
        rag_context = ""
        msg_lower = user_message.lower()
        matched_dest_names = []  # Danh sách địa điểm khớp với câu hỏi hiện tại

        for dest in destinations:
            match_found = False

            # 1. Kiểm tra theo tên địa điểm
            if dest.name.lower() in msg_lower:
                match_found = True

            # 2. Kiểm tra theo từ khóa nếu chưa match
            if not match_found and dest.keywords:
                kw_list = [k.strip().lower() for k in dest.keywords.split(',') if k.strip()]
                for kw in kw_list:
                    if kw and kw in msg_lower:
                        match_found = True
                        break

            if not match_found:
                continue

            # Địa điểm này khớp → thêm vào matched list
            matched_dest_names.append(dest.name)

            # Kiểm tra cache: nếu Frontend đã có → không đọc file lại
            if dest.name.lower() in loaded_destinations:
                print(f"[RAG] Cache hit: {dest.name} (đã có ở Frontend, bỏ qua đọc file)")
                continue

            # Cache miss → đọc file mới
            try:
                file_path = dest.info_file.path
                print(f"[RAG] Cache miss: Đọc file mới → {file_path}")
                if os.path.exists(file_path):
                    with open(file_path, 'r', encoding='utf-8') as f:
                        content = f.read()
                    # Trim nội dung tối đa 3000 ký tự để tránh context quá lớn
                    if len(content) > 3000:
                        content = content[:3000] + "\n...(còn tiếp)"
                    rag_context += f"\n\n=== DỮ LIỆU ĐỊA ĐIỂM: {dest.name} ===\n{content}\n"
                    print(f"[RAG] Đã đọc {len(content)} ký tự cho {dest.name}")
                else:
                    print(f"[RAG] File không tồn tại: {file_path}")
            except Exception as e:
                print(f"[RAG] Lỗi đọc file {dest.name}: {e}")

        # --- Chuẩn bị messages cho Ollama ---
        ollama_messages = []

        # 1. System Prompt
        ollama_messages.append({"role": "system", "content": system_instruction})

        # 2. History (chỉ giữ 8 tin nhắn gần nhất để giảm context)
        for msg in history[-8:]:
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