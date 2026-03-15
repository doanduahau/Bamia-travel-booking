import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Clock, Star } from 'lucide-react';

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
            imageUrl = `http://127.0.0.1:8000${imagePath}`;
        }
    }
    // --- KẾT THÚC ĐOẠN XỬ LÝ ẢNH ---

    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300">
            <img src={imageUrl} alt={tour.title} className="w-full h-48 object-cover" />
            <div className="p-5">
                <div className="flex justify-between items-center mb-2">
                    <span className="flex items-center text-sm text-gray-500">
                        <MapPin className="w-4 h-4 mr-1 text-blue-500" />
                        {tour.location_detail?.name || 'Chưa cập nhật'}
                    </span>
                    <span className="flex items-center text-sm font-semibold text-yellow-500">
                        <Star className="w-4 h-4 mr-1 fill-current" />
                        {tour.rating}
                    </span>
                </div>

                <h3 className="text-lg font-bold text-gray-800 mb-2 truncate" title={tour.title}>
                    {tour.title}
                </h3>

                <div className="flex items-center text-sm text-gray-600 mb-4">
                    <Clock className="w-4 h-4 mr-1" />
                    {tour.duration}
                </div>

                <div className="flex justify-between items-center border-t pt-4">
                    <div className="text-xl font-bold text-blue-600">
                        {Number(tour.price).toLocaleString('vi-VN')} VNĐ
                    </div>
                    <Link
                        to={`/tours/${tour.id}`}
                        className="px-4 py-2 bg-blue-100 text-blue-600 rounded-md hover:bg-[#005555] hover:text-white transition-colors"
                    >
                        Xem chi tiết
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default TourCard;