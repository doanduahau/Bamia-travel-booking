import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import { Calendar, Users, CreditCard, Clock, Trash2, ShoppingCart } from 'lucide-react';

const BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL || 'http://127.0.0.1:8000';

const MyBookings = () => {
    const [activeTab, setActiveTab] = useState('bookings'); // 'bookings' hoặc 'cart'

    const [bookings, setBookings] = useState([]);
    const [cartItems, setCartItems] = useState([]);
    const [selectedCartItems, setSelectedCartItems] = useState([]);
    const [loading, setLoading] = useState(true);

    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }
        fetchData();
    }, [user, navigate]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [bookingRes, cartRes] = await Promise.all([
                api.get('bookings/'),
                api.get('cart/')
            ]);
            setBookings(bookingRes.data);
            setCartItems(cartRes.data);
        } catch (error) {
            console.error("Lỗi lấy dữ liệu:", error);
        } finally {
            setLoading(false);
        }
    };

    // --- CÁC HÀM XỬ LÝ GIỎ HÀNG ---
    const updateCartQuantity = async (cartId, newQuantity) => {
        if (newQuantity < 1) return;
        try {
            await api.patch(`cart/${cartId}/`, { number_of_people: newQuantity });
            // Cập nhật lại UI không cần load lại API
            setCartItems(cartItems.map(item => item.id === cartId ? { ...item, number_of_people: newQuantity } : item));
        } catch (error) {
            console.error("Lỗi cập nhật số lượng:", error);
        }
    };

    // Bỏ cartItem khỏi danh sách được chọn nếu nó bị xóa
    const removeFromCart = async (cartId) => {
        if (!window.confirm("Bạn có chắc muốn xóa tour này khỏi giỏ hàng?")) return;
        try {
            await api.delete(`cart/${cartId}/`);
            setCartItems(cartItems.filter(item => item.id !== cartId));
            setSelectedCartItems(prev => prev.filter(id => id !== cartId));
        } catch (error) {
            console.error("Lỗi xóa giỏ hàng:", error);
        }
    };

    // --- CÁC HÀM XỬ LÝ CHỌN TOUR THANH TOÁN ---
    const handleSelectCartItem = (cartId) => {
        setSelectedCartItems(prev =>
            prev.includes(cartId) ? prev.filter(id => id !== cartId) : [...prev, cartId]
        );
    };

    const isAllSelected = cartItems.length > 0 && selectedCartItems.length === cartItems.length;

    const handleSelectAll = () => {
        if (isAllSelected) {
            setSelectedCartItems([]);
        } else {
            setSelectedCartItems(cartItems.map(item => item.id));
        }
    };

    // Tính tổng tiền giỏ hàng (chỉ tính những item được chọn)
    const cartTotal = cartItems
        .filter(item => selectedCartItems.includes(item.id))
        .reduce((total, item) => {
            return total + (item.tour_detail.price * item.number_of_people);
        }, 0);

    // Xử lý đường dẫn ảnh DRF
    const getImageUrl = (imagePath) => {
        if (!imagePath) return 'https://via.placeholder.com/150';
        if (imagePath.startsWith('http')) return imagePath;
        return `${BACKEND_BASE_URL}${imagePath.startsWith('/') ? imagePath : `/${imagePath}`}`;
    };

    const handleCheckout = () => {
        const selectedData = cartItems.filter(item => selectedCartItems.includes(item.id));
        navigate('/payments', { state: { selectedCartItems: selectedData, totalAmount: cartTotal } });
    };

    const handleRetryPayment = (booking) => {
        navigate('/payments', {
            state: {
                pendingBookings: [booking],
                totalAmount: Number(booking.total_price)
            }
        });
    };

    // Hủy booking đang Pending
    const handleCancelBooking = async (bookingId) => {
        if (!window.confirm('Bạn có chắc muốn hủy đơn hàng này?')) return;
        try {
            await api.patch(`bookings/${bookingId}/cancel/`);
            setBookings(bookings.filter(b => b.id !== bookingId));
        } catch (error) {
            console.error('Lỗi hủy đơn:', error);
            alert('Không thể hủy đơn hàng. Vui lòng thử lại.');
        }
    };

    if (loading) return <div className="text-center py-20 text-xl text-gray-500">Đang tải dữ liệu...</div>;

    return (
        <div className="max-w-5xl mx-auto px-4 py-12">
            <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">Quản Lý Chuyến Đi</h1>

            {/* HỆ THỐNG TAB */}
            <div className="flex justify-center mb-8 border-b">
                <button
                    className={`px-8 py-3 font-semibold text-lg transition-colors ${activeTab === 'bookings' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-blue-500'}`}
                    onClick={() => setActiveTab('bookings')}
                >
                    Lịch sử đặt tour
                </button>
                <button
                    className={`px-8 py-3 font-semibold text-lg transition-colors flex items-center gap-2 ${activeTab === 'cart' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-blue-500'}`}
                    onClick={() => setActiveTab('cart')}
                >
                    <ShoppingCart className="w-5 h-5" /> Giỏ hàng ({cartItems.length})
                </button>
            </div>

            {/* TAB LỊCH SỬ ĐẶT TOUR */}
            {activeTab === 'bookings' && (
                <div>
                    {bookings.length === 0 ? (
                        <div className="text-center py-16 bg-white rounded-lg shadow-sm border border-gray-200">
                            <p className="text-xl text-gray-500 mb-4">Bạn chưa đặt chuyến đi nào.</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {bookings.map((booking) => (
                                <div key={booking.id} className="bg-white p-6 rounded-xl shadow-md border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
                                    <div className="flex-grow">
                                        <h3 className="text-xl font-bold text-gray-800 mb-2">Mã đơn: #{booking.id}</h3>
                                        <p className="text-gray-600"><Calendar className="inline w-4 h-4 mr-1" /> Ngày đi: {booking.date}</p>
                                        <p className="text-gray-600"><Users className="inline w-4 h-4 mr-1" /> Số người: {booking.number_of_people}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-2xl font-bold text-blue-600">{Number(booking.total_price).toLocaleString('vi-VN')} đ</p>
                                        <span className={`px-3 py-1 rounded-full text-sm mt-2 inline-block ${booking.status === 'Paid' ? 'bg-green-100 text-green-800' : booking.status === 'Cancelled' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                            {booking.status === 'Paid' ? 'Đã Thanh Toán' : booking.status === 'Cancelled' ? 'Đã Hủy' : 'Chờ Thanh Toán'}
                                        </span>
                                        {booking.status === 'Pending' && (
                                            <div className="mt-2 flex flex-row justify-end gap-2">
                                                <button
                                                    onClick={() => handleRetryPayment(booking)}
                                                    className="bg-orange-500 text-white text-sm font-bold py-1.5 px-4 rounded-lg hover:bg-orange-600 transition"
                                                >
                                                    Thanh toán ngay →
                                                </button>
                                                <button
                                                    onClick={() => handleCancelBooking(booking.id)}
                                                    className="bg-red-50 text-red-600 text-sm font-medium py-1.5 px-3 rounded-lg border border-red-200 hover:bg-red-100 transition"
                                                >
                                                    Hủy đơn hàng
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* TAB GIỎ HÀNG */}
            {activeTab === 'cart' && (
                <div>
                    {cartItems.length === 0 ? (
                        <div className="text-center py-16 bg-white rounded-lg shadow-sm border border-gray-200">
                            <p className="text-xl text-gray-500 mb-4">Giỏ hàng của bạn đang trống.</p>
                            <Link to="/tours" className="inline-block bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition">
                                Tìm tour ngay
                            </Link>
                        </div>
                    ) : (
                        <div className="flex flex-col lg:flex-row gap-8">
                            {/* Danh sách Tour trong giỏ */}
                            <div className="lg:w-2/3 space-y-6">
                                {cartItems.map((item) => (
                                    <div key={item.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-col sm:flex-row gap-4 relative items-start sm:items-center">
                                        <input
                                            type="checkbox"
                                            className="w-5 h-5 cursor-pointer rounded border-gray-300 text-blue-600 focus:ring-blue-500 mt-2 sm:mt-0"
                                            checked={selectedCartItems.includes(item.id)}
                                            onChange={() => handleSelectCartItem(item.id)}
                                        />
                                        <img src={getImageUrl(item.tour_detail.image)} alt={item.tour_detail.title} className="w-full sm:w-32 h-32 object-cover rounded-lg" />

                                        <div className="flex-grow flex flex-col justify-between">
                                            <div>
                                                <h3 className="text-lg font-bold text-gray-800 line-clamp-2">{item.tour_detail.title}</h3>
                                                <p className="text-blue-600 font-semibold mt-1">{Number(item.tour_detail.price).toLocaleString('vi-VN')} đ / người</p>
                                                {item.date && <p className="text-sm text-gray-500 mt-1">Ngày dự kiến: {item.date}</p>}
                                            </div>

                                            <div className="flex items-center gap-4 mt-4">
                                                <div className="flex items-center border rounded-lg overflow-hidden">
                                                    <button onClick={() => updateCartQuantity(item.id, item.number_of_people - 1)} className="px-3 py-1 bg-gray-100 hover:bg-gray-200 font-bold">-</button>
                                                    <span className="px-4 py-1 font-medium">{item.number_of_people}</span>
                                                    <button onClick={() => updateCartQuantity(item.id, item.number_of_people + 1)} className="px-3 py-1 bg-gray-100 hover:bg-gray-200 font-bold">+</button>
                                                </div>
                                                <button onClick={() => removeFromCart(item.id)} className="text-red-500 hover:text-red-700 flex items-center text-sm font-medium">
                                                    <Trash2 className="w-4 h-4 mr-1" /> Xóa
                                                </button>
                                            </div>
                                        </div>

                                        <div className="sm:absolute right-4 bottom-4 text-right">
                                            <p className="text-sm text-gray-500">Thành tiền</p>
                                            <p className="text-xl font-bold text-orange-500">
                                                {Number(item.tour_detail.price * item.number_of_people).toLocaleString('vi-VN')} đ
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Bảng tính tổng tiền */}
                            <div className="lg:w-1/3">
                                <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 sticky top-24">
                                    <h3 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2 flex justify-between items-center">
                                        Tóm tắt đơn hàng
                                        <label className="text-sm font-normal text-gray-600 flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                className="w-4 h-4 rounded border-gray-300 cursor-pointer"
                                                checked={isAllSelected}
                                                onChange={handleSelectAll}
                                            />
                                            Chọn tất cả
                                        </label>
                                    </h3>
                                    <div className="flex justify-between items-center mb-4 text-gray-600">
                                        <span>Tour được chọn:</span>
                                        <span className="font-semibold">{selectedCartItems.length} / {cartItems.length}</span>
                                    </div>
                                    <div className="flex justify-between items-center mb-6 text-lg">
                                        <span className="font-bold text-gray-800">Tổng cộng:</span>
                                        <span className="font-bold text-orange-600 text-2xl">{cartTotal.toLocaleString('vi-VN')} đ</span>
                                    </div>
                                    <button
                                        className={`w-full font-bold py-3 rounded-lg transition-colors ${selectedCartItems.length === 0 ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-orange-500 text-white hover:bg-orange-600'}`}
                                        disabled={selectedCartItems.length === 0}
                                        onClick={handleCheckout}
                                    >
                                        Thanh toán {selectedCartItems.length > 0 && `(${selectedCartItems.length})`}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default MyBookings;