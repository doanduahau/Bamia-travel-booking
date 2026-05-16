# Bamia Travel Booking - Hệ thống đặt tour du lịch

Dự án thực tập cơ sở: Xây dựng website đặt tour du lịch trực tuyến với chatbot hỗ trợ AI.

## 🏗 Cấu trúc dự án

Dự án bao gồm 2 phần chính:
- **travel-backend**: Django REST Framework (Backend API)
- **travel-frontend**: React + Vite + Tailwind CSS (Frontend UI)

---

## 🚀 Hướng dẫn cài đặt

### 1. Backend (Django)

Di chuyển vào thư mục backend:
```bash
cd travel-backend
```

**Khởi tạo môi trường ảo:**
```bash
python -m venv venv
source venv/bin/activate  # Trên macOS/Linux
# venv\Scripts\activate  # Trên Windows
```

**Cài đặt các thư viện cần thiết:**
```bash
pip install -r requirements.txt
```

**Cấu hình môi trường:**
- Sao chép file `.env.example` thành `.env`
- Cập nhật các thông số trong file `.env` (SECRET_KEY, API Keys,...)

**Chạy Migration và khởi động server:**
```bash
python manage.py migrate
python manage.py runserver
```

---

### 2. Frontend (React + Vite)

Di chuyển vào thư mục frontend:
```bash
cd travel-frontend
```

**Cài đặt dependencies:**
```bash
npm install
```

**Cấu hình môi trường:**
- Sao chép file `.env.example` thành `.env`
- Đảm bảo `VITE_API_BASE_URL` trỏ đúng về địa chỉ của Backend.

**Khởi động ứng dụng ở chế độ development:**
```bash
npm run dev
```

---

## 🛠 Công nghệ sử dụng

- **Backend:** Django, Django REST Framework, SQLite (Mặc định).
- **Frontend:** React, Vite, Tailwind CSS, Lucide React (Icons).
- **AI Integration:** Google Gemini API (Chatbot hỗ trợ tư vấn du lịch).
- **Other APIs:** OpenWeather API (Dự báo thời tiết).

---

## 📝 Ghi chú
- Hiện tại dự án đang sử dụng **SQLite** để tiện cho việc phát triển nhanh.
- Để chuyển sang **PostgreSQL**, vui lòng cập nhật `DATABASES` trong `core/settings.py` và cài đặt `psycopg2-binary`.
