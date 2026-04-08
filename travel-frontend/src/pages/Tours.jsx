import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../api/axios';
import TourCard from '../components/TourCard';
import { Search } from 'lucide-react';

const Tours = () => {

    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const urlSearchTerm = queryParams.get('search') || ''; // Lấy chữ "Đà Nẵng" từ URL

    const [tours, setTours] = useState([]);
    const [loading, setLoading] = useState(true);

    // State cho bộ lọc
    const [searchTerm, setSearchTerm] = useState(urlSearchTerm);
    const [ordering, setOrdering] = useState('');

    // Hàm gọi API lấy danh sách tour
    const fetchTours = async () => {
        setLoading(true);
        try {
            // SỬA LỖI 1: Bỏ dấu '/' ở đầu chữ tours
            let query = 'tours/?';
            if (searchTerm) query += `search=${searchTerm}&`;
            if (ordering) query += `ordering=${ordering}&`;

            const response = await api.get(query);

            // SỬA LỖI 2: Đề phòng Django trả về dữ liệu phân trang (có chứa chữ results)
            const toursData = response.data.results ? response.data.results : response.data;
            setTours(toursData);

        } catch (error) {
            console.error("Lỗi khi tải danh sách tour:", error);
        } finally {
            setLoading(false);
        }
    };

    // Gọi API lần đầu khi vào trang và mỗi khi ấn Tìm kiếm/Đổi sắp xếp
    useEffect(() => {
        fetchTours();
    }, [ordering]); // Gọi lại khi đổi tiêu chí sắp xếp

    const handleSearch = (e) => {
        e.preventDefault();
        fetchTours();
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">Khám Phá Các Tour Du Lịch</h1>

            {/* Thanh Tìm Kiếm & Lọc */}
            <div className="bg-white p-4 rounded-lg shadow-md mb-8 flex flex-col md:flex-row gap-4 items-center justify-between">
                <form onSubmit={handleSearch} className="flex w-full md:w-1/2">
                    <input
                        type="text"
                        placeholder="Tìm kiếm theo tên tour, mô tả..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="flex-grow border border-gray-300 rounded-l-md px-4 py-2 focus:outline-none focus:border-blue-500"
                    />
                    <button type="submit" className="bg-[#005555] text-white px-4 py-2 rounded-r-md hover:bg-blue-500 flex items-center">
                        <Search className="w-5 h-5 mr-1" /> Tìm
                    </button>
                </form>

                <div className="w-full md:w-auto flex items-center gap-2">
                    <label className="text-gray-600 font-medium">Sắp xếp:</label>
                    <select
                        value={ordering}
                        onChange={(e) => setOrdering(e.target.value)}
                        className="border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:border-blue-500"
                    >
                        <option value="">Mới nhất</option>
                        <option value="price">Giá tăng dần</option>
                        <option value="-price">Giá giảm dần</option>
                        <option value="-rating">Đánh giá cao nhất</option>
                    </select>
                </div>
            </div>

            {/* Danh sách Tour */}
            {loading ? (
                <div className="text-center py-20 text-gray-500 text-xl">Đang tải dữ liệu...</div>
            ) : tours.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {tours.map(tour => (
                        <TourCard key={tour.id} tour={tour} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 text-gray-500 text-xl">Không tìm thấy tour nào phù hợp.</div>
            )}
        </div>
    );
};

export default Tours;