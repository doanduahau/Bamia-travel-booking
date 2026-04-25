import React, { useState, useEffect, useContext, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import api from '../api/axios'; 
import axios from 'axios';       
import { AuthContext } from '../context/AuthContext';
import PageBanner from '../components/PageBanner';

const BANNER_IMAGE = 'https://images.unsplash.com/photo-1516738901171-8eb4fc13bd20?auto=format&fit=crop&q=80&w=2000';

const ItineraryPage = () => {
    const calendarRef = useRef(null);
    const [events, setEvents] = useState([]);
    const [weatherMap, setWeatherMap] = useState({}); 
    const [weatherError, setWeatherError] = useState('');
    const [loading, setLoading] = useState(true);
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }

        const fetchAllData = async () => {
            try {
                // 1. Hàm gọi API Lịch trình từ Backend Django
                const response = await api.get('my-itinerary/');
                const itineraryEvents = response.data;
                setEvents(itineraryEvents);

                // 2. Lấy danh sách các Thành Phố duy nhất có trong giỏ hàng/đã đặt
                const locations = [...new Set(itineraryEvents.map(e => e.extendedProps?.location_name).filter(Boolean))];

                const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY; 
                if (!API_KEY) {
                    setWeatherError('Thiếu VITE_OPENWEATHER_API_KEY. Hãy kiểm tra file .env và khởi động lại frontend.');
                    return;
                }

                const dailyWeather = {}; // Lưu trữ theo dạng: dailyWeather[Y-M-D][CityName] = { temp, icon... }

                const normalizeCityName = (city) => {
                    const map = {
                        'hà nội': 'Ha Noi',
                        'hồ chí minh': 'Ho Chi Minh City',
                        'đà lạt': 'Da Lat',
                        'đà nẵng': 'Da Nang',
                        'hội an': 'Hoi An',
                    };
                    const lower = city.toLowerCase().trim();
                    return map[lower] || city;
                };

                const fetchForecastByCity = async (city) => {
                    const normalizedCity = normalizeCityName(city);
                    try {
                        // Ưu tiên geocoding để xử lý tên thành phố tiếng Việt có dấu
                        const geoRes = await axios.get('https://api.openweathermap.org/geo/1.0/direct', {
                            params: {
                                q: normalizedCity,
                                limit: 1,
                                appid: API_KEY,
                            }
                        });

                        if (Array.isArray(geoRes.data) && geoRes.data.length > 0) {
                            const { lat, lon } = geoRes.data[0];
                            return axios.get('https://api.openweathermap.org/data/2.5/forecast', {
                                params: {
                                    lat,
                                    lon,
                                    units: 'metric',
                                    appid: API_KEY,
                                    lang: 'vi',
                                }
                            });
                        }
                    } catch (e) {
                        // fallback bên dưới
                    }

                    // Fallback theo q=city
                    return axios.get('https://api.openweathermap.org/data/2.5/forecast', {
                        params: {
                            q: normalizedCity,
                            units: 'metric',
                            appid: API_KEY,
                            lang: 'vi',
                        }
                    });
                };

                // 3. Duyệt gọi API từng thành phố (chạy song song)
                const weatherPromises = locations.map(async (city) => {
                    try {
                        const res = await fetchForecastByCity(city);
                        
                        res.data.list.forEach(item => {
                            const date = item.dt_txt.split(' ')[0]; // Lấy chuỗi YYYY-MM-DD
                            const time = item.dt_txt.split(' ')[1]; // Lấy HH:MM:SS
                            
                            if (!dailyWeather[date]) dailyWeather[date] = {};

                            // Lọc mốc 12h trưa mỗi ngày
                            if (time === '12:00:00' || !dailyWeather[date][city]) {
                                dailyWeather[date][city] = {
                                    temp: Math.round(item.main.temp),
                                    icon: item.weather[0].icon,       
                                    desc: item.weather[0].description,
                                    city: city
                                };
                            }
                        });
                    } catch (error) {
                        console.error(`Lỗi tải thời tiết cho ${city}:`, error);
                        setWeatherError('Không tải được một phần dữ liệu thời tiết.');
                    }
                });

                await Promise.all(weatherPromises); // Đợi tất cả fetch xong
                setWeatherMap(dailyWeather);

            } catch (error) {
                console.error("Lỗi tải lịch trình:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchAllData();
    }, [user, navigate]);

    // HÀM: Render Widget Thời Tiết nhúng vào từng ô ngày
    const renderDayCell = (cellInfo) => {
        const year = cellInfo.date.getFullYear();
        const month = String(cellInfo.date.getMonth() + 1).padStart(2, '0');
        const day = String(cellInfo.date.getDate()).padStart(2, '0');
        const dateKey = `${year}-${month}-${day}`;

        // Kiểm tra xem ở ngày này người dùng đang có tour ở Thành phố nào không?
        const dayEvents = events.filter(e => e.start <= dateKey && e.end > dateKey);
        
        let weatherContent = null;

        if (dayEvents.length > 0 && weatherMap[dateKey]) {
            // Ưu tiên hiển thị thời tiết của thành phố xuất hiện đầu tiên trong danh sách sự kiện ngày đó
            const targetCity = dayEvents[0].extendedProps?.location_name;
            const weather = weatherMap[dateKey][targetCity];

            if (weather) {
                const iconUrl = `https://openweathermap.org/img/wn/${weather.icon}.png`;
                weatherContent = (
                    <div
                        className="w-full py-1 px-1.5 rounded-md border border-blue-100 bg-blue-50 flex flex-col items-center justify-center overflow-hidden"
                        title={`${weather.desc} tại ${weather.city}`}
                    >
                        <div className="flex items-center justify-center gap-1 leading-none">
                            <img src={iconUrl} alt={weather.desc} className="w-4 h-4 object-contain" />
                            <span className="text-[11px] font-extrabold text-blue-800">{weather.temp}°C</span>
                        </div>
                        <div className="mt-0.5 text-[9px] text-gray-700 text-center leading-tight truncate w-full">
                            {weather.desc}
                        </div>
                    </div>
                );
            }
        }

        return (
            <div className="w-full h-full flex flex-col items-center pt-1 px-1 overflow-hidden">
                <div className="w-full flex items-center justify-center gap-1">
                    {cellInfo.date.getDate() === 1 && (
                        <span className="text-[10px] font-bold text-blue-700 leading-none whitespace-nowrap">
                            T{cellInfo.date.getMonth() + 1}
                        </span>
                    )}
                    <span className="text-sm font-semibold text-gray-700 bg-gray-100 rounded-full w-6 h-6 flex items-center justify-center shadow-sm">
                        {cellInfo.date.getDate()}
                    </span>
                </div>
                <div className="flex-1 w-full flex items-center justify-center pb-1">
                    {weatherContent}
                </div>
            </div>
        );
    };

    const handleEventClick = (clickInfo) => {
        const event = clickInfo.event;
        const status = event.extendedProps.status;
        const title = event.title || "";

        // 1. Nếu là đơn hàng trong giỏ (màu cam, tiêu đề có [Giỏ hàng])
        if (status === 'cart' || title.includes('[Giỏ hàng]')) {
            navigate('/my-bookings', { state: { activeTab: 'cart' } });
        } 
        // 2. Nếu là tour đã thanh toán hoặc chờ thanh toán (đã tạo booking)
        else {
            navigate('/my-bookings', { state: { activeTab: 'bookings' } });
        }
    };

    if (loading) {
        return (
            <div className="bg-slate-50 min-h-screen pb-20">
                <PageBanner
                    title="Lịch Trình Chuyến Đi"
                    subtitle="Theo dõi các tour bạn đã đặt cùng dự báo thời tiết tại đúng địa điểm tour đó."
                    image={BANNER_IMAGE}
                />
                <div className="max-w-7xl mx-auto px-4 py-12 relative z-10">
                    <div className="mt-2 bg-white rounded-2xl shadow-lg border border-slate-100 p-8 animate-pulse">
                        <div className="h-8 w-72 bg-slate-200 rounded mx-auto mb-4"></div>
                        <div className="h-4 w-96 max-w-full bg-slate-200 rounded mx-auto mb-8"></div>
                        <div className="h-[560px] bg-slate-100 rounded-xl border border-slate-200"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-slate-50 min-h-screen pb-20">
            <PageBanner 
                title="Lịch Trình Chuyến Đi"
                subtitle="Theo dõi các tour bạn đã đặt cùng dự báo thời tiết tại đúng địa điểm tour đó."
                image={BANNER_IMAGE}
            />
            
            <div className="max-w-7xl mx-auto px-4 py-12 relative z-10">
                <div className="mt-2 mb-8 bg-white p-6 rounded-2xl shadow-lg border border-slate-100">
                    <div className="text-center mb-5">
                        <h2 className="text-2xl md:text-3xl font-bold text-slate-800">Theo dõi lịch trình thông minh</h2>
                        <p className="text-slate-500 mt-2">Màu trạng thái đơn hàng và widget thời tiết được cập nhật theo từng ngày.</p>
                    </div>

                    {weatherError && (
                        <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg inline-block px-3 py-1.5 mb-5">
                            {weatherError}
                        </p>
                    )}

                    <div className="flex justify-center gap-3 flex-wrap">
                        <div className="flex items-center gap-2 bg-emerald-50 px-4 py-2 rounded-full border border-emerald-100">
                            <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 shadow-sm"></span>
                            <span className="text-sm font-bold text-emerald-800">Đã thanh toán</span>
                        </div>
                        <div className="flex items-center gap-2 bg-amber-50 px-4 py-2 rounded-full border border-amber-100">
                            <span className="w-3.5 h-3.5 rounded-full bg-amber-400 shadow-sm"></span>
                            <span className="text-sm font-bold text-amber-800">Chờ thanh toán</span>
                        </div>
                        <div className="flex items-center gap-2 bg-orange-50 px-4 py-2 rounded-full border border-orange-100">
                            <span className="w-3.5 h-3.5 rounded-full bg-orange-500 shadow-sm"></span>
                            <span className="text-sm font-bold text-orange-800">Dự định đi (Trong giỏ)</span>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-xl border border-slate-100">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-4">
                        <h3 className="text-xl font-bold text-slate-800">Lịch theo tuần hiển thị 35 ngày</h3>
                        <p className="text-sm text-slate-500">Nhấn vào sự kiện để mở chi tiết tour</p>
                    </div>

                    {events.length === 0 ? (
                        <div className="text-center py-16 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                            <p className="text-lg font-semibold text-slate-700 mb-2">Bạn chưa có lịch trình nào để hiển thị</p>
                            <p className="text-slate-500 mb-6">Hãy đặt tour hoặc thêm tour vào giỏ để theo dõi trên lịch.</p>
                            <Link
                                to="/tours"
                                className="inline-flex items-center justify-center h-11 px-6 rounded-full bg-orange-500 text-white font-semibold hover:bg-orange-600 transition-colors"
                            >
                                Khám phá tour ngay
                            </Link>
                        </div>
                    ) : (
                        <div className="calendar-container">
                            <FullCalendar
                                ref={calendarRef}
                                plugins={[dayGridPlugin, interactionPlugin]}
                                initialView="dayGridMonth35"
                                views={{
                                    dayGridMonth35: {
                                        type: 'dayGrid',
                                        dateIncrement: { months: 1 },
                                        buttonText: 'Tháng',
                                        titleFormat: { year: 'numeric', month: 'long' },
                                        visibleRange: (currentDate) => {
                                            const firstOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
                                            const mondayBasedDay = (firstOfMonth.getDay() + 6) % 7; // Mon=0 ... Sun=6
                                            const start = new Date(firstOfMonth);
                                            start.setDate(firstOfMonth.getDate() - mondayBasedDay);

                                            const end = new Date(start);
                                            end.setDate(start.getDate() + 35);

                                            return { start, end };
                                        },
                                    },
                                }}
                                firstDay={1}
                                events={events}
                                eventClick={handleEventClick}
                                dayCellContent={renderDayCell}
                                height={780}
                                expandRows={true}
                                fixedWeekCount={false}
                                dayMaxEvents={3}
                                customButtons={{
                                    prevYearBtn: {
                                        text: '«',
                                        click: () => calendarRef.current?.getApi().incrementDate({ years: -1 }),
                                    },
                                    prevBtn: {
                                        text: '‹',
                                        click: () => calendarRef.current?.getApi().incrementDate({ months: -1 }),
                                    },
                                    nextBtn: {
                                        text: '›',
                                        click: () => calendarRef.current?.getApi().incrementDate({ months: 1 }),
                                    },
                                    nextYearBtn: {
                                        text: '»',
                                        click: () => calendarRef.current?.getApi().incrementDate({ years: 1 }),
                                    },
                                }}
                                headerToolbar={{
                                    left: 'prevYearBtn,prevBtn',
                                    center: 'title',
                                    right: 'nextBtn,nextYearBtn'
                                }}
                                eventContent={(arg) => (
                                    <div
                                        className="overflow-hidden w-full h-full flex items-center gap-1 px-1.5 py-[2px]"
                                        title={arg.event.title}
                                    >
                                        <span className="text-white text-[11px] font-semibold truncate leading-tight">
                                            {arg.event.title}
                                        </span>
                                    </div>
                                )}
                                eventClassNames="cursor-pointer rounded-sm"
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ItineraryPage;