import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import TourCard from '../components/TourCard';
import { Search, Globe, Shield, ThumbsUp, Heart } from 'lucide-react';
const popularDestinations = [
    { id: 1, name: 'Đà Nẵng', image: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&q=80&w=2000' },
    { id: 2, name: 'Hà Nội', image: 'https://images.unsplash.com/photo-1555921015-5532091f6026?auto=format&fit=crop&q=80&w=2000' },
    { id: 3, name: 'Hồ Chí Minh', image: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?auto=format&fit=crop&q=80&w=2000' },
    { id: 4, name: 'Hội An', image: 'https://images.unsplash.com/photo-1536599018102-9f803c140fc1?auto=format&fit=crop&q=80&w=2000' },
];
const Home = () => {
    const [featuredTours, setFeaturedTours] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const navigate = useNavigate();

    const [currentBgIndex, setCurrentBgIndex] = useState(0);

    useEffect(() => {
        // Cài đặt đổi ảnh mỗi 5 giây (5000ms)
        const interval = setInterval(() => {
            setCurrentBgIndex((prevIndex) => (prevIndex + 1) % popularDestinations.length);
        }, 3000);

        // Dọn dẹp interval khi rời khỏi trang Home
        return () => clearInterval(interval);
    }, []);

    // Lấy danh sách tour nổi bật từ Backend
    useEffect(() => {
        const fetchTours = async () => {
            try {
                // Lấy các tour sắp xếp theo rating cao nhất
                const response = await api.get('tours/?ordering=-rating');
                const allTours = response.data.results ? response.data.results : response.data;
                // Chỉ lấy 3 tour đầu tiên làm Featured
                setFeaturedTours(allTours.slice(0, 3));
            } catch (error) {
                console.error("Lỗi tải tour:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchTours();
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            // Encode chuỗi để tránh lỗi với các ký tự đặc biệt/tiếng Việt có dấu
            navigate(`/tours?search=${encodeURIComponent(searchQuery.trim())}`);
        } else {
            // Nếu để trống thì cứ chuyển sang trang Tours xem tất cả
            navigate('/tours');
        }
    };

    // Dữ liệu tĩnh cho Destinations (Vì Backend Destination chưa có field ảnh)
    // const popularDestinations = [
    //     { id: 1, name: 'Đà Nẵng', image: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&q=80&w=800' },
    //     { id: 2, name: 'Hà Nội', image: 'https://images.unsplash.com/photo-1555921015-5532091f6026?auto=format&fit=crop&q=80&w=800' },
    //     { id: 3, name: 'Hồ Chí Minh', image: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?auto=format&fit=crop&q=80&w=800' },
    //     { id: 4, name: 'Hội An', image: 'https://images.unsplash.com/photo-1536599018102-9f803c140fc1?auto=format&fit=crop&q=80&w=800' },
    // ];

    return (
        <div className="w-full">
            {/* 1. HERO SECTION */}
            <div className="relative h-[80vh] flex items-center justify-center overflow-hidden">

                {/* --- ĐOẠN ĐƯỢC THAY THẾ: Ảnh nền chuyển đổi mượt mà --- */}
                <div className="absolute inset-0 z-0 bg-black">
                    {popularDestinations.map((dest, index) => (
                        <div
                            key={dest.id}
                            className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ease-in-out ${index === currentBgIndex ? 'opacity-100' : 'opacity-0'
                                }`}
                            style={{ backgroundImage: `url('${dest.image}')` }}
                        ></div>
                    ))}
                    {/* Lớp phủ màu đen để chữ dễ đọc hơn */}
                    <div className="absolute inset-0 bg-black bg-opacity-40"></div>
                </div>
                {/* --- KẾT THÚC ĐOẠN THAY THẾ --- */}

                {/* Nội dung Hero */}
                <div className="relative z-10 text-center px-4 w-full max-w-4xl">
                    <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-6 drop-shadow-lg">
                        Khám phá thế giới cùng chúng tôi
                    </h1>
                    <p className="text-lg md:text-2xl text-gray-200 mb-10 drop-shadow-md">
                        Hành trình vạn dặm bắt đầu từ một bước chân. Đặt tour ngay hôm nay!
                    </p>

                    {/* Thanh tìm kiếm */}
                    <form onSubmit={handleSearch} className="flex flex-col md:flex-row bg-white p-2 rounded-2xl md:rounded-full shadow-2xl max-w-3xl mx-auto">
                        <div className="flex-grow flex items-center px-4 py-2">
                            <Search className="text-gray-400 w-6 h-6 mr-3" />
                            <input
                                type="text"
                                placeholder="Bạn muốn đi đâu?"
                                className="w-full bg-transparent border-none focus:outline-none text-gray-700 text-lg"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <button type="submit" className="bg-blue-600 text-white font-bold text-lg px-8 py-4 bg-[#005555] md:rounded-full hover:bg-blue-500 transition-colors w-full md:w-auto mt-2 md:mt-0">
                            Khám phá
                        </button>
                    </form>
                </div>
            </div>

            {/* 2. POPULAR DESTINATIONS */}
            <div className="max-w-7xl mx-auto px-4 py-20">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">Điểm Đến Phổ Biến</h2>
                    <p className="text-gray-600 max-w-2xl mx-auto">Những địa điểm tuyệt vời nhất đang chờ đón bạn khám phá và trải nghiệm.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {popularDestinations.map(dest => (
                        <div key={dest.id}
                            onClick={() => navigate(`/tours?search=${dest.name}`)}
                            className="group relative h-72 rounded-2xl overflow-hidden cursor-pointer shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                            <img src={dest.image} alt={dest.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                            <h3 className="absolute bottom-6 left-6 text-2xl font-bold text-white">{dest.name}</h3>
                        </div>
                    ))}
                </div>
            </div>

            {/* 3. FEATURED TOURS */}
            <div className="bg-gray-50 py-20">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex justify-between items-end mb-12">
                        <div>
                            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">Tour Nổi Bật</h2>
                            <p className="text-gray-600">Những chuyến đi được đánh giá cao nhất bởi khách hàng.</p>
                        </div>
                        <button onClick={() => navigate('/tours')} className="hidden md:inline-block text-blue-600 font-semibold hover:text-blue-800 hover:underline">
                            Xem tất cả tour &rarr;
                        </button>
                    </div>

                    {loading ? (
                        <div className="text-center py-10 text-gray-500">Đang tải tour nổi bật...</div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {featuredTours.map(tour => (
                                // Tận dụng component TourCard đã làm, tự động có hiệu ứng hover và shadow
                                <TourCard key={tour.id} tour={tour} />
                            ))}
                        </div>
                    )}

                    <button onClick={() => navigate('/tours')} className="w-full mt-8 py-3 bg-white border border-blue-600 text-blue-600 rounded-xl font-bold md:hidden hover:bg-blue-50 transition">
                        Xem tất cả tour
                    </button>
                </div>
            </div>

            {/* 4. WHY CHOOSE US */}
            <div className="max-w-7xl mx-auto px-4 py-20">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">Tại Sao Chọn TravelBaMia?</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                    <div className="text-center p-6 rounded-2xl hover:bg-white hover:shadow-xl transition-all duration-300 border border-transparent hover:border-gray-100">
                        <div className="w-16 h-16 mx-auto bg-blue-100 text-blue-600 flex items-center justify-center rounded-2xl mb-6 transform rotate-3 hover:rotate-0 transition-transform">
                            <Globe className="w-8 h-8" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 mb-3">Mạng lưới toàn cầu</h3>
                        <p className="text-gray-600">Hàng ngàn điểm đến hấp dẫn trên toàn thế giới với mức giá cực kỳ ưu đãi.</p>
                    </div>

                    <div className="text-center p-6 rounded-2xl hover:bg-white hover:shadow-xl transition-all duration-300 border border-transparent hover:border-gray-100">
                        <div className="w-16 h-16 mx-auto bg-green-100 text-green-600 flex items-center justify-center rounded-2xl mb-6 transform -rotate-3 hover:rotate-0 transition-transform">
                            <Shield className="w-8 h-8" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 mb-3">Thanh toán an toàn</h3>
                        <p className="text-gray-600">Hệ thống bảo mật tối đa, hỗ trợ đa dạng phương thức thanh toán.</p>
                    </div>

                    <div className="text-center p-6 rounded-2xl hover:bg-white hover:shadow-xl transition-all duration-300 border border-transparent hover:border-gray-100">
                        <div className="w-16 h-16 mx-auto bg-red-100 text-red-600 flex items-center justify-center rounded-2xl mb-6 transform rotate-3 hover:rotate-0 transition-transform">
                            <Heart className="w-8 h-8" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 mb-3">Dịch vụ tận tâm</h3>
                        <p className="text-gray-600">Đội ngũ hỗ trợ 24/7 luôn sẵn sàng đồng hành cùng bạn trên mọi nẻo đường.</p>
                    </div>
                </div>
            </div>

            {/* 5. TESTIMONIALS */}
            <div className="bg-blue-600 py-20">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Khách Hàng Nói Gì Về Chúng Tôi</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { id: 1, name: 'Nguyễn Văn A', role: 'Doanh nhân', quote: 'Dịch vụ rất chuyên nghiệp, hướng dẫn viên nhiệt tình. Tôi chắc chắn sẽ quay lại!' },
                            { id: 2, name: 'Trần Thị B', role: 'Giáo viên', quote: 'Website đặt tour dễ dàng, giao diện đẹp mắt và giá cả vô cùng minh bạch.' },
                            { id: 3, name: 'Lê Hoàng C', role: 'Nhiếp ảnh gia', quote: 'Nhờ TravelVi mà tôi đã có những bức ảnh tuyệt đẹp tại những địa điểm độc lạ.' },
                        ].map(review => (
                            <div key={review.id} className="bg-white p-8 rounded-2xl shadow-lg relative">
                                <ThumbsUp className="absolute top-8 right-8 text-gray-200 w-10 h-10" />
                                <p className="text-gray-700 mb-6 italic relative z-10">"{review.quote}"</p>
                                <div className="flex items-center">
                                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-xl mr-4">
                                        {review.name.charAt(0)}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-800">{review.name}</h4>
                                        <span className="text-sm text-gray-500">{review.role}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

        </div>
    );
};

export default Home;