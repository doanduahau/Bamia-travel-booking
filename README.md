# 🌍 TravelBaMia - Hệ Thống Đặt Tour Du Lịch Thông Minh Tích Hợp AI

> **Dự án thực tập cơ sở:** Xây dựng Website đặt tour du lịch trực tuyến, tích hợp lịch trình thông minh dự báo thời tiết và trợ lý ảo AI cục bộ (Local AI Chatbot) hỗ trợ tìm kiếm và tư vấn thông minh.

Dự án đã được tối ưu hóa toàn diện, nâng cấp hệ thống cơ sở dữ liệu lên **PostgreSQL** cực kỳ mạnh mẽ, tái cấu trúc giao diện với font chữ tiếng Việt chuyên nghiệp **"Be Vietnam Pro"** và sở hữu một AI Chatbot cực kỳ nhạy bén, bảo mật cao.

---

## 📸 Điểm Nổi Bật Của Hệ Thống

### 1. 🤖 Trợ Lý Ảo AI Đa Năng (Local AI Chatbot)
Tích hợp mô hình ngôn ngữ lớn chạy cục bộ **Ollama (Qwen 2.5: 1.5B/7B)** giúp tối ưu chi phí vận hành, bảo mật dữ liệu tuyệt đối và tốc độ phản hồi cực nhanh:
* **Công nghệ RAG (Retrieval-Augmented Generation) thông minh:** Tự động phát hiện địa điểm khách hàng đang hỏi, nạp dữ liệu chi tiết của địa danh đó từ file tài liệu của hệ thống theo thời gian thực để AI trả lời chính xác, tránh hiện tượng ảo tưởng (hallucination).
* **Đồng bộ hóa dữ liệu thời gian thực (Database-Aware):** AI tự động nhận diện trạng thái của khách hàng (đã đăng nhập/chưa đăng nhập), chào hỏi bằng tên cá nhân, biết rõ giỏ hàng và danh sách đơn hàng đã đặt của người dùng để tư vấn cá nhân hóa.
* **Tự động liên kết thẻ Tour trực quan (UI Card Rendering):** Khi AI giới thiệu tour, hệ thống tự động chèn thẻ Tour động (`[TOUR_CARD:ID]`) dưới khung chat để khách hàng click xem chi tiết hoặc đặt tour trực tiếp vô cùng hiện đại.
* **Quy tắc gợi ý tối đa 3 Tour:** Khi hỏi chung chung, AI tự động lấy ra tối đa 3 tour nổi bật nhất (ưu tiên theo đánh giá rating sao từ cao xuống thấp) và chỉ hiển thị dạng danh sách tinh gọn kèm thẻ Card, không rườm rà.
* **Xử lý khớp điểm đến thông minh:** AI tự động hiểu và khớp yêu cầu của khách hàng (ví dụ: *"cho tôi xem tour Đà Lạt"* sẽ tự động ánh xạ chính xác đến tour *"Quảng Trường Lâm Viên (Địa điểm: Đà Lạt)"* trong database).
* **Cơ chế bảo mật 30 phút:** Lịch sử chat được lưu trữ an toàn và sẽ **tự động xóa sạch hoàn toàn** sau 30 phút đóng trình duyệt hoặc khi tắt server để bảo vệ tối đa dữ liệu cá nhân của người dùng.

### 2. 📅 Lịch Trình Lịch Lãm & Tích Hợp Dự Báo Thời Tiết
* Giao diện lịch biểu thông minh **FullCalendar** hiển thị 35 ngày trực quan.
* **Tích hợp OpenWeather API:** Tự động định vị địa điểm của từng tour bạn đặt (như Nha Trang, Đà Lạt...) và hiển thị widget thời tiết nhiệt độ, biểu tượng trời mưa/nắng chính xác theo từng ngày tại đúng ô lịch của tour đó!
* Bộ lọc trạng thái đơn hàng trực quan qua màu sắc (Đã thanh toán - Xanh lá, Chờ thanh toán - Vàng, Trong giỏ hàng - Cam).

### 3. 🛍️ Quản Lý Đơn Hàng & Giỏ Hàng Nâng Cao
* Hỗ trợ thanh toán tích hợp nhiều tour cùng lúc.
* **Thùng rác thông minh (Soft Delete):** Đơn hàng khi xóa sẽ được đưa vào thùng rác, tự động đếm ngược 30 ngày trước khi xóa vĩnh viễn và cho phép khôi phục lại bất kỳ lúc nào chỉ bằng 1-click!

---

## 🏗️ Cấu Trúc Dự Án

Dự án được xây dựng theo kiến trúc tách biệt hoàn toàn giữa Client và Server (Monorepo):
* **`travel-backend`:** Django REST Framework (Python 3) cung cấp RESTful APIs, tích hợp công cụ stream Token AI từ Ollama, quản lý Database qua **PostgreSQL**.
* **`travel-frontend`:** React 18 + Vite + Tailwind CSS + Lucide Icons, sử dụng font chữ **Be Vietnam Pro** tinh tế và mượt mà.

---

## 🚀 Hướng Dẫn Cài Đặt & Chạy Dự Án

### 📦 Yêu Cầu Hệ Thống
* **Node.js** (Phiên bản >= 18)
* **Python** (Phiên bản >= 3.10)
* **PostgreSQL** (Đã khởi tạo database)
* **Ollama** (Đã cài đặt cục bộ và chạy mô hình `qwen2.5:1.5b` hoặc `qwen2.5:7b`)

---

### 1. Cấu Hình & Khởi Động Backend (Django)

Di chuyển vào thư mục backend:
```bash
cd travel-backend
```

**Khởi tạo virtual environment và kích hoạt:**
```bash
# Trên Windows
python -m venv venv
venv\Scripts\activate

# Trên macOS/Linux
python3 -m venv venv
source venv/bin/activate
```

**Cài đặt các thư viện:**
```bash
pip install -r requirements.txt
```

**Cấu hình môi trường (`.env`):**
Sao chép file `.env.example` thành `.env` và điền đầy đủ các thông số kết nối cơ sở dữ liệu PostgreSQL của bạn:
```env
SECRET_KEY=your_secret_key
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# PostgreSQL Configuration
DB_NAME=your_postgres_db_name
DB_USER=your_postgres_user
DB_PASSWORD=your_postgres_password
DB_HOST=127.0.0.1
DB_PORT=5432

# Ollama AI Configuration
OLLAMA_MODEL=qwen2.5:1.5b
```

**Chạy Migrations và chạy Server:**
```bash
python manage.py makemigrations
python manage.py migrate
python manage.py runserver
```
Backend sẽ khởi chạy tại: `http://127.0.0.1:8000/`

---

### 2. Cấu Hợp & Khởi Động Frontend (React + Vite)

Di chuyển vào thư mục frontend:
```bash
cd ../travel-frontend
```

**Cài đặt các dependencies:**
```bash
npm install
```

**Cấu hình môi trường (`.env`):**
Sao chép file `.env.example` thành `.env`:
```env
VITE_API_BASE_URL=http://127.0.0.1:8000/api/
VITE_OPENWEATHER_API_KEY=your_openweather_api_key
```

**Khởi chạy ứng dụng:**
```bash
npm run dev
```
Frontend sẽ khởi chạy tại: `http://localhost:5173/` hoặc địa chỉ hiển thị trong terminal của bạn.

---

### 3. Cài Đặt Trợ Lý AI (Ollama Local)

1. Tải và cài đặt Ollama tại [ollama.com](https://ollama.com).
2. Mở terminal và tải mô hình Qwen về máy:
   ```bash
   ollama pull qwen2.5:1.5b
   ```
3. Đảm bảo ứng dụng Ollama đang chạy ở nền (AI Chatbot sẽ tự động kết nối qua cổng local `http://127.0.0.1:11434`).

---

## 🛠️ Công Nghệ Sử Dụng

* **Frontend:** React, React Router Dom, Tailwind CSS, FullCalendar, Axios, Lucide React, JWT-decode.
* **Backend:** Django, Django REST Framework, Simple JWT (Authentication), PostgreSQL, Requests (Streaming AI Tokens).
* **AI & API:** Ollama Local LLM, OpenWeather Map API.
* **Fonts & Styling:** Font chữ **Be Vietnam Pro** (Google Fonts) tối ưu di động và hiển thị dấu tiếng Việt hoàn mỹ.

---

## 📝 Bản Quyền & Ghi Chú
Dự án được xây dựng và tối ưu hóa toàn diện cho kỳ thực tập cơ sở. Mọi dữ liệu cá nhân, giỏ hàng và lịch trình du lịch đều được bảo mật tối đa, mang lại trải nghiệm đặt tour thông minh chuẩn kỷ nguyên số! 🌟
