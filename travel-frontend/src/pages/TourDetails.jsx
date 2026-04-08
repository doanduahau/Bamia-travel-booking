import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import { MapPin, Clock, Star, Users, Calendar } from 'lucide-react';

const BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL || 'http://127.0.0.1:8000';

const TourDetails = () => {
    const { id } = useParams(); // Lấy ID từ URL
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);

    const [tour, setTour] = useState(null);
    const [loading, setLoading] = useState(true);

    // State cho form đặt tour
    const [date, setDate] = useState('');
    const [numberOfPeople, setNumberOfPeople] = useState(1);
    const [bookingMessage, setBookingMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        const fetchTourDetail = async () => {
            try {
                const response = await api.get(`tours/${id}/`);
                setTour(response.data);
            } catch (error) {
                console.error("Lỗi khi tải chi tiết tour:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchTourDetail();
    }, [id]);

    const handleBooking = async (e) => {
        e.preventDefault();
        setBookingMessage({ type: '', text: '' });

        if (!user) {
            alert('Bạn cần đăng nhập để đặt tour!');
            navigate('/login');
            return;
        }

        try {
            // Gọi API tạo booking mới
            const response = await api.post('bookings/', {
                tour: tour.id,
                date: date,
                number_of_people: numberOfPeople
            });

            setBookingMessage({ type: 'success', text: 'Đặt tour thành công! Bạn có thể xem trong lịch sử.' });
            setDate(''); // Reset form
            setNumberOfPeople(1);
        } catch (error) {
            console.error(error);
            setBookingMessage({ type: 'error', text: 'Có lỗi xảy ra, vui lòng thử lại.' });
        }
    };

    const handleAddToCart = async (e) => {
        e.preventDefault();
        setBookingMessage({ type: '', text: '' });

        if (!user) {
            alert('Bạn cần đăng nhập để thêm vào giỏ hàng!');
            navigate('/login');
            return;
        }

        try {
            await api.post('cart/', {
                tour: tour.id,
                date: date || null, // Nếu chưa chọn ngày thì để null
                number_of_people: numberOfPeople
            });
            setBookingMessage({ type: 'success', text: 'Đã thêm tour vào giỏ hàng!' });
        } catch (error) {
            console.error(error);
            setBookingMessage({ type: 'error', text: 'Lỗi khi thêm vào giỏ hàng.' });
        }
    };

    if (loading) return <div className="text-center py-20 text-xl text-gray-500">Đang tải thông tin tour...</div>;
    if (!tour) return <div className="text-center py-20 text-xl text-red-500">Không tìm thấy tour!</div>;

    // Xử lý ảnh thông minh (giống TourCard)
    let imageUrl = 'https://via.placeholder.com/800x400?text=No+Image';
    if (tour.image) {
        if (tour.image.startsWith('http')) imageUrl = tour.image;
        else imageUrl = `${BACKEND_BASE_URL}${tour.image.startsWith('/') ? tour.image : `/${tour.image}`}`;
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="flex flex-col lg:flex-row gap-8">

                {/* Cột trái: Thông tin Tour */}
                <div className="lg:w-2/3">
                    <img src={imageUrl} alt={tour.title} className="w-full h-80 object-cover rounded-xl shadow-md mb-6" />
                    <h1 className="text-3xl font-bold text-gray-800 mb-4">{tour.title}</h1>

                    <div className="flex flex-wrap items-center gap-6 mb-6 text-gray-600 border-b pb-6">
                        <span className="flex items-center"><MapPin className="w-5 h-5 mr-2 text-blue-500" /> {tour.location_detail?.name || 'Chưa cập nhật'}</span>
                        <span className="flex items-center"><Clock className="w-5 h-5 mr-2 text-blue-500" /> {tour.duration}</span>
                        <span className="flex items-center font-semibold text-yellow-500"><Star className="w-5 h-5 mr-2 fill-current" /> {tour.rating} Đánh giá</span>
                    </div>

                    <div className="mb-8">
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">Tổng quan chuyến đi</h2>
                        <p className="text-gray-700 leading-relaxed whitespace-pre-line">{tour.description}</p>
                    </div>
                </div>

                {/* Cột phải: Form Đặt Tour */}
                <div className="lg:w-1/3">
                    <div className="bg-white p-6 rounded-xl shadow-lg sticky top-24 border border-gray-100">
                        <div className="text-3xl font-bold text-blue-600 mb-6 pb-4 border-b">
                            {Number(tour.price).toLocaleString('vi-VN')} VNĐ <span className="text-sm font-normal text-gray-500">/ người</span>
                        </div>

                        {bookingMessage.text && (
                            <div className={`p-3 rounded mb-4 text-sm ${bookingMessage.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                {bookingMessage.text}
                            </div>
                        )}

                        <form>
                            <div className="mb-4">
                                <label className="flex items-center text-gray-700 font-medium mb-2">
                                    <Calendar className="w-4 h-4 mr-2" /> Chọn ngày đi
                                </label>
                                <input
                                    type="date"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    className="w-full border border-gray-300 px-4 py-2 rounded focus:outline-none focus:border-blue-500"
                                    required
                                    min={new Date().toISOString().split('T')[0]} // Không cho chọn ngày trong quá khứ
                                />
                            </div>

                            <div className="mb-6">
                                <label className="flex items-center text-gray-700 font-medium mb-2">
                                    <Users className="w-4 h-4 mr-2" /> Số người
                                </label>
                                <input
                                    type="number"
                                    value={numberOfPeople}
                                    onChange={(e) => setNumberOfPeople(parseInt(e.target.value))}
                                    min="1"
                                    max={tour.available_slots}
                                    className="w-full border border-gray-300 px-4 py-2 rounded focus:outline-none focus:border-blue-500"
                                    required
                                />
                            </div>

                            <div className="flex justify-between items-center mb-6 text-lg font-bold">
                                <span>Tổng tiền:</span>
                                <span className="text-blue-600">{Number(tour.price * numberOfPeople).toLocaleString('vi-VN')} VNĐ</span>
                            </div>

                            {user ? (
                                <div className="space-y-3">
                                    {/* Sửa lại nút 1 */}
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            // Kiểm tra xem form đã điền đủ required chưa
                                            if (e.target.form.checkValidity()) {
                                                handleBooking(e);
                                            } else {
                                                e.target.form.reportValidity(); // Hiện cảnh báo đỏ của trình duyệt
                                            }
                                        }}
                                        className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition-colors"
                                    >
                                        Xác nhận đặt tour ngay
                                    </button>

                                    {/* Sửa lại nút 2 */}
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            // Kiểm tra tương tự cho nút giỏ hàng
                                            if (e.target.form.checkValidity()) {
                                                handleAddToCart(e);
                                            } else {
                                                e.target.form.reportValidity();
                                            }
                                        }}
                                        className="w-full bg-orange-500 text-white font-bold py-3 rounded-lg hover:bg-orange-600 transition-colors"
                                    >
                                        Thêm vào giỏ hàng
                                    </button>
                                </div>
                            ) : (
                                <Link to="/login" className="block text-center w-full bg-gray-200 text-gray-700 font-bold py-3 rounded-lg hover:bg-gray-300 transition-colors">
                                    Đăng nhập để đặt tour
                                </Link>
                            )}
                        </form>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default TourDetails;