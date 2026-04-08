import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import { Users, Map, ShoppingBag, DollarSign, Activity } from 'lucide-react';

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        // Bảo mật sơ bộ ở Frontend (Backend đã chặn rồi nhưng ta chặn thêm cho chắc)
        if (!user || user.username !== 'admin') {
            navigate('/');
            return;
        }

        const fetchDashboardData = async () => {
            try {
                const response = await api.get('admin-dashboard/');
                setStats(response.data);
            } catch (err) {
                console.error("Lỗi tải dữ liệu admin:", err);
                setError('Bạn không có quyền truy cập trang này hoặc lỗi máy chủ.');
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [user, navigate]);

    if (loading) return <div className="text-center py-20 text-xl text-gray-500">Đang tải dữ liệu hệ thống...</div>;
    if (error) return <div className="text-center py-20 text-xl text-red-500 font-bold">{error}</div>;

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="flex items-center gap-3 mb-8 border-b pb-4">
                <Activity className="w-8 h-8 text-blue-600" />
                <h1 className="text-3xl font-bold text-gray-800">Tổng Quan Hệ Thống (Admin)</h1>
            </div>

            {/* THẺ THỐNG KÊ */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 border-l-4 border-l-blue-500">
                    <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center"><Users className="w-7 h-7" /></div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Tổng Khách Hàng</p>
                        <p className="text-2xl font-bold text-gray-800">{stats.total_users}</p>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 border-l-4 border-l-green-500">
                    <div className="w-14 h-14 bg-green-50 text-green-600 rounded-full flex items-center justify-center"><Map className="w-7 h-7" /></div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Tour Đang Mở</p>
                        <p className="text-2xl font-bold text-gray-800">{stats.total_tours}</p>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 border-l-4 border-l-orange-500">
                    <div className="w-14 h-14 bg-orange-50 text-orange-600 rounded-full flex items-center justify-center"><ShoppingBag className="w-7 h-7" /></div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Tổng Lượt Đặt</p>
                        <p className="text-2xl font-bold text-gray-800">{stats.total_bookings}</p>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 border-l-4 border-l-purple-500">
                    <div className="w-14 h-14 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center"><DollarSign className="w-7 h-7" /></div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Doanh Thu Tạm Tính</p>
                        <p className="text-2xl font-bold text-purple-600">{Number(stats.revenue).toLocaleString('vi-VN')} đ</p>
                    </div>
                </div>
            </div>

            {/* BẢNG ĐƠN HÀNG MỚI NHẤT */}
            <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-100">
                    <h2 className="text-xl font-bold text-gray-800">Đơn Đặt Tour Mới Nhất</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-white text-gray-500 text-sm uppercase border-b">
                                <th className="px-6 py-4 font-semibold">Mã Đơn</th>
                                <th className="px-6 py-4 font-semibold">Khách Hàng</th>
                                <th className="px-6 py-4 font-semibold">Tên Tour</th>
                                <th className="px-6 py-4 font-semibold">Ngày Đi</th>
                                <th className="px-6 py-4 font-semibold">Tổng Tiền</th>
                                <th className="px-6 py-4 font-semibold">Trạng Thái</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {stats.recent_bookings.map((booking) => (
                                <tr key={booking.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 font-bold text-blue-600">#{booking.id}</td>
                                    <td className="px-6 py-4 font-medium text-gray-800">{booking.user}</td>
                                    <td className="px-6 py-4 text-gray-600 truncate max-w-[200px]" title={booking.tour}>{booking.tour}</td>
                                    <td className="px-6 py-4 text-gray-600">{booking.date}</td>
                                    <td className="px-6 py-4 font-bold text-gray-800">{Number(booking.total).toLocaleString('vi-VN')} đ</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${booking.status === 'Confirmed' ? 'bg-green-100 text-green-700' :
                                                booking.status === 'Cancelled' ? 'bg-red-100 text-red-700' :
                                                    'bg-yellow-100 text-yellow-700'
                                            }`}>
                                            {booking.status === 'Confirmed' ? 'Đã duyệt' : booking.status === 'Cancelled' ? 'Đã hủy' : 'Chờ duyệt'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {stats.recent_bookings.length === 0 && (
                    <div className="text-center py-8 text-gray-500">Chưa có đơn đặt tour nào.</div>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;