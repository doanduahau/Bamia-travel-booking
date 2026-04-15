import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Clock, Star } from 'lucide-react';

const BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL || 'http://127.0.0.1:8000';

const TourCard = ({ tour }) => {
    // --- ĐOẠN XỬ LÝ ẢNH THÔNG MINH ĐÃ ĐƯỢC CẬP NHẬT ---
    let imageUrl = 'https://via.placeholder.com/400x300?text=No+Image';

    if (tour.image) {
        // Nếu API trả về đường dẫn đã có sẵn http (ví dụ: http://127.0.0.1:8000/images/...)
        if (tour.image.startsWith('http')) {
            imageUrl = tour.image;
        }
        // Nếu API chỉ trả về path tương đối (ví dụ: /images/tours/... hoặc tours/...)
        else {
            // Đảm bảo không bị dư hoặc thiếu dấu gạch chéo
            const imagePath = tour.image.startsWith('/') ? tour.image : `/${tour.image}`;
            imageUrl = `${BACKEND_BASE_URL}${imagePath}`;
        }
    }
    // --- KẾT THÚC ĐOẠN XỬ LÝ ẢNH ---

    return (
        <div className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-2xl transition-all duration-500 group border border-gray-100">
            <div className="relative overflow-hidden h-52">
                <img src={imageUrl} alt={tour.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full flex items-center shadow-sm">
                    <Star className="w-3.5 h-3.5 mr-1 text-orange-500 fill-orange-500" />
                    <span className="text-xs font-bold text-gray-800">{tour.rating}</span>
                </div>
            </div>
            
            <div className="p-6">
                <div className="flex items-center text-xs font-bold text-orange-600 uppercase tracking-wider mb-2">
                    <MapPin className="w-3.5 h-3.5 mr-1" />
                    {tour.location_detail?.name || 'Chưa cập nhật'}
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-[#005555] transition-colors line-clamp-1" title={tour.title}>
                    {tour.title}
                </h3>

                <div className="flex items-center text-sm text-gray-500 mb-6 font-medium">
                    <Clock className="w-4 h-4 mr-2 text-teal-600" />
                    {tour.duration}
                </div>

                <div className="flex justify-between items-center border-t border-gray-100 pt-5">
                    <div className="flex flex-col">
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Giá từ</span>
                        <div className="text-xl font-extrabold text-[#005555]">
                            {Number(tour.price).toLocaleString('vi-VN')} <span className="text-xs">VNĐ</span>
                        </div>
                    </div>
                    <Link
                        to={`/tours/${tour.id}`}
                        className="px-5 py-2.5 bg-[#005555] text-white text-sm font-bold rounded-full hover:bg-orange-500 shadow-md hover:shadow-orange-500/20 transition-all transform hover:scale-105"
                    >
                        Xem chi tiết
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default TourCard;