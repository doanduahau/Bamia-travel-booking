import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import { MapPin, Clock, Star, Users, Calendar } from 'lucide-react';
import PageBanner from '../components/PageBanner';

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

    // Review states
    const [reviews, setReviews] = useState([]);
    const [newRating, setNewRating] = useState(5);
    const [newComment, setNewComment] = useState('');
    const [isSubmittingReview, setIsSubmittingReview] = useState(false);

    useEffect(() => {
        const fetchTourData = async () => {
            try {
                const [tourRes, reviewsRes] = await Promise.all([
                    api.get(`tours/${id}/`),
                    api.get(`reviews/?tour=${id}`)
                ]);
                setTour(tourRes.data);
                setReviews(reviewsRes.data);
            } catch (error) {
                console.error("Lỗi khi tải chi tiết tour hoặc đánh giá:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchTourData();
    }, [id]);

    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        if (!user) return;
        setIsSubmittingReview(true);
        try {
            await api.post('reviews/', {
                tour: id,
                rating: newRating,
                comment: newComment
            });
            setNewComment('');
            setNewRating(5);
            // Fetch anew to update total tour rating and the review list
            const [tourRes, reviewsRes] = await Promise.all([
                api.get(`tours/${id}/`),
                api.get(`reviews/?tour=${id}`)
            ]);
            setTour(tourRes.data);
            setReviews(reviewsRes.data);
            alert('Cảm ơn bạn đã gửi đánh giá!');
        } catch (err) {
            console.error(err);
            alert('Có lỗi xảy ra khi gửi đánh giá, vui lòng thử lại.');
        } finally {
            setIsSubmittingReview(false);
        }
    };

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
        <div className="bg-gray-50 min-h-screen pb-20">
            <PageBanner
                title={tour.title}
                subtitle={`Khám phá ${tour.location_detail?.name || 'địa điểm tuyệt vời'} cùng TravelBaMia`}
                image={imageUrl}
            />

            <div className="max-w-7xl mx-auto px-4 py-8 relative z-10">
                <div className="-mt-10 md:-mt-12 flex flex-col lg:flex-row gap-8">
                    {/* Cột trái: Thông tin Tour */}
                    <div className="lg:w-2/3">
                        <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 mb-8">
                            <h2 className="text-3xl font-bold text-gray-800 mb-6">Chi tiết chuyến đi</h2>

                            <div className="flex flex-wrap items-center gap-6 mb-6 text-gray-600 border-b pb-6">
                                <span className="flex items-center"><MapPin className="w-5 h-5 mr-2 text-blue-500" /> {tour.location_detail?.name || 'Chưa cập nhật'}</span>
                                <span className="flex items-center"><Clock className="w-5 h-5 mr-2 text-blue-500" /> {tour.duration}</span>
                                <span className="flex items-center font-semibold text-yellow-500"><Star className="w-5 h-5 mr-2 fill-current" /> {tour.rating} Đánh giá</span>
                            </div>

                            <div className="mb-8">
                                <h2 className="text-2xl font-bold text-gray-800 mb-4">Tổng quan chuyến đi</h2>
                                <p className="text-gray-700 leading-relaxed whitespace-pre-line">{tour.description}</p>
                            </div>

                            {/* Khu vực Đánh giá */}
                            <div className="mt-12 pt-8 border-t border-gray-100">
                                <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                                    Đánh giá từ khách hàng 
                                    <span className="ml-3 bg-blue-100 text-blue-800 text-sm py-1 px-3 rounded-full font-semibold">
                                        {reviews.length} đánh giá
                                    </span>
                                </h2>

                                {/* Danh sách đánh giá */}
                                {reviews.length === 0 ? (
                                    <p className="text-gray-500 italic mb-8">Chưa có đánh giá nào cho chuyến đi này. Hãy là người đầu tiên!</p>
                                ) : (
                                    <div className="space-y-6 mb-10">
                                        {reviews.map((rv) => (
                                            <div key={rv.id} className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                                                <div className="flex justify-between items-start mb-2">
                                                    <div>
                                                        <p className="font-bold text-gray-800">{rv.username || 'Người dùng ẩn danh'}</p>
                                                        <p className="text-xs text-gray-400 mt-0.5">{new Date(rv.created_at).toLocaleDateString('vi-VN')}</p>
                                                    </div>
                                                    <div className="flex text-yellow-500">
                                                        {[...Array(5)].map((_, i) => (
                                                            <Star key={i} className={`w-4 h-4 ${i < rv.rating ? 'fill-current' : 'text-gray-300'}`} />
                                                        ))}
                                                    </div>
                                                </div>
                                                <p className="text-gray-700 mt-3 text-sm leading-relaxed">{rv.comment}</p>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Form gửi đánh giá */}
                                <div className="bg-white border text-left border-gray-200 rounded-2xl p-6 lg:p-8 shadow-sm">
                                    <h3 className="text-lg font-bold text-gray-800 mb-4">Viết đánh giá của bạn</h3>
                                    {user ? (
                                        <form onSubmit={handleReviewSubmit}>
                                            <div className="mb-5 flex items-center">
                                                <span className="mr-3 text-gray-700 font-medium text-sm">Chất lượng:</span>
                                                <div className="flex">
                                                    {[1, 2, 3, 4, 5].map((star) => (
                                                        <button 
                                                            type="button" 
                                                            key={star} 
                                                            onClick={() => setNewRating(star)}
                                                            className="focus:outline-none transition-transform hover:scale-110"
                                                        >
                                                            <Star className={`w-7 h-7 mx-0.5 ${star <= newRating ? 'text-yellow-500 fill-current' : 'text-gray-300'} transition-colors`} />
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="mb-5">
                                                <textarea 
                                                    className="w-full border border-gray-300 rounded-xl p-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none" 
                                                    rows="4" 
                                                    placeholder="Chia sẻ trải nghiệm của bạn về chuyến đi này..."
                                                    value={newComment}
                                                    onChange={(e) => setNewComment(e.target.value)}
                                                    required
                                                ></textarea>
                                            </div>
                                            <button 
                                                type="submit" 
                                                disabled={isSubmittingReview}
                                                className={`px-6 py-3 rounded-xl font-bold text-white transition-all shadow-md ${isSubmittingReview ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 hover:-translate-y-0.5'}`}
                                            >
                                                {isSubmittingReview ? 'Đang gửi...' : 'Gửi đánh giá'}
                                            </button>
                                        </form>
                                    ) : (
                                        <div className="bg-gray-50 border border-gray-200 p-5 rounded-xl text-center">
                                            <p className="text-gray-600 mb-3 block">Bạn cần đăng nhập để có thể tham gia đánh giá.</p>
                                            <Link to="/login" className="inline-block bg-blue-600 text-white font-semibold py-2 px-6 rounded-lg hover:bg-blue-700 transition">Đăng nhập ngay</Link>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Cột phải: Form Đặt Tour */}
                    <div className="lg:w-1/3">
                        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 mb-8">
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
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                if (e.target.form.checkValidity()) {
                                                    handleBooking(e);
                                                } else {
                                                    e.target.form.reportValidity();
                                                }
                                            }}
                                            className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition-colors"
                                        >
                                            Xác nhận đặt tour ngay
                                        </button>

                                        <button
                                            type="button"
                                            onClick={(e) => {
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
        </div>
    );
};

export default TourDetails;