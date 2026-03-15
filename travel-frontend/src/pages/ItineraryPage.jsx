import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import api from '../api/axios'; // Dùng cho Backend của bạn
import axios from 'axios';       // Dùng để gọi OpenWeather API
import { AuthContext } from '../context/AuthContext';

const ItineraryPage = () => {
    const [events, setEvents] = useState([]);
    const [weatherMap, setWeatherMap] = useState({}); // Lưu trữ thời tiết theo ngày
    const [loading, setLoading] = useState(true);
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }

        // 1. Hàm gọi API Lịch trình từ Backend Django
        const fetchItinerary = async () => {
            try {
                const response = await api.get('my-itinerary/');
                setEvents(response.data);
            } catch (error) {
                console.error("Lỗi tải lịch trình:", error);
            }
        };

        // 2. Hàm gọi API Thời tiết thật từ OpenWeatherMap
        const fetchWeather = async () => {
            try {
                const API_KEY = 'khê'; // <--- DÁN KEY VÀO ĐÂY
                const CITY = 'Ho Chi Minh'; // Bạn có thể đổi thành Hanoi, Da Nang...

                // Gọi API dự báo 5 ngày
                const res = await axios.get(`https://api.openweathermap.org/data/2.5/forecast?q=${CITY}&units=metric&appid=${API_KEY}&lang=vi`);

                const dailyWeather = {};

                // OpenWeather trả về mảng cứ 3 tiếng 1 lần. Ta sẽ lọc lấy thời tiết lúc 12h trưa mỗi ngày.
                res.data.list.forEach(item => {
                    const date = item.dt_txt.split(' ')[0]; // Lấy chuỗi YYYY-MM-DD
                    const time = item.dt_txt.split(' ')[1]; // Lấy chuỗi HH:MM:SS

                    // Ưu tiên lấy mốc 12:00 trưa, hoặc nếu ngày đó chưa có thì lấy mốc đầu tiên tìm thấy
                    if (time === '12:00:00' || !dailyWeather[date]) {
                        dailyWeather[date] = {
                            temp: Math.round(item.main.temp), // Làm tròn nhiệt độ
                            icon: item.weather[0].icon,       // Mã icon của OpenWeather
                            desc: item.weather[0].description // Mô tả tiếng Việt (Nắng, mưa...)
                        };
                    }
                });

                setWeatherMap(dailyWeather);
            } catch (error) {
                console.error("Lỗi tải thời tiết (Có thể do API Key chưa kích hoạt):", error);
            }
        };

        // Chạy cả 2 hàm song song
        Promise.all([fetchItinerary(), fetchWeather()]).finally(() => {
            setLoading(false);
        });

    }, [user, navigate]);

    // HÀM: Render Widget Thời Tiết nhúng vào từng ô ngày
    const renderDayCell = (cellInfo) => {
        // Lấy ngày của ô hiện tại và format chuẩn thành YYYY-MM-DD
        const year = cellInfo.date.getFullYear();
        const month = String(cellInfo.date.getMonth() + 1).padStart(2, '0');
        const day = String(cellInfo.date.getDate()).padStart(2, '0');
        const dateKey = `${year}-${month}-${day}`;

        // Kiểm tra xem ngày này có dữ liệu thời tiết không
        const weather = weatherMap[dateKey];
        let weatherContent = null;

        if (weather) {
            // Lấy trực tiếp icon thật từ server của OpenWeather
            const iconUrl = `https://openweathermap.org/img/wn/${weather.icon}.png`;
            weatherContent = (
                <div className="flex flex-col items-center mt-0.5 opacity-90 cursor-help transition-transform hover:scale-110" title={weather.desc}>
                    <img src={iconUrl} alt={weather.desc} className="w-8 h-8" />
                    <span className="text-xs font-bold text-gray-700">{weather.temp}°C</span>
                </div>
            );
        }

        return (
            <div className="w-full h-full flex flex-col items-center justify-start pt-1">
                <span className="text-sm font-medium text-gray-600">{cellInfo.dayNumberText}</span>
                {weatherContent}
            </div>
        );
    };

    const handleEventClick = (clickInfo) => {
        const tourId = clickInfo.event.extendedProps.tour_id;
        if (tourId) navigate(`/tours/${tourId}`);
    };

    if (loading) return <div className="text-center py-20 text-xl text-gray-500">Đang tải lịch trình và thời tiết...</div>;

    return (
        <div className="max-w-7xl mx-auto px-4 py-12">
            <div className="text-center mb-10">
                <h1 className="text-3xl font-bold text-gray-800 mb-4">Lịch Trình Chuyến Đi</h1>
                <p className="text-gray-600">Theo dõi các tour bạn đã đặt cùng dự báo thời tiết 5 ngày tới.</p>

                <div className="flex justify-center gap-6 mt-6">
                    <div className="flex items-center gap-2">
                        <span className="w-4 h-4 rounded-full bg-emerald-500 shadow-sm"></span>
                        <span className="text-sm font-medium text-gray-700">Tour đã xác nhận</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-4 h-4 rounded-full bg-orange-500 shadow-sm"></span>
                        <span className="text-sm font-medium text-gray-700">Dự định đi (Trong giỏ)</span>
                    </div>
                </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100">
                <div className="calendar-container">
                    <FullCalendar
                        plugins={[dayGridPlugin, interactionPlugin]}
                        initialView="dayGridMonth"
                        events={events}
                        eventClick={handleEventClick}
                        dayCellContent={renderDayCell}
                        height="auto"
                        headerToolbar={{
                            left: 'prev,next today',
                            center: 'title',
                            right: 'dayGridMonth,dayGridWeek'
                        }}
                        eventClassNames="cursor-pointer shadow-sm rounded-md px-1 text-xs md:text-sm font-semibold truncate transition-transform hover:scale-[1.02]"
                    />
                </div>
            </div>
        </div>
    );
};

export default ItineraryPage;