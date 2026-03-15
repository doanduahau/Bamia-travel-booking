import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);

    return (
        <nav className="shadow-md sticky top-0 z-50 bg-[#005555]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center">
                        <Link to="/" className="text-2xl font-bold text-white">TravelBaMia</Link>
                    </div>
                    <div className="flex items-center space-x-4">
                        <Link to="/" className="text-white hover:text-blue-300 font-medium">Trang chủ</Link>
                        <Link to="/tours" className="text-white hover:text-blue-300 font-medium">Tours</Link>
                        <Link to="/contact" className="text-white hover:text-blue-300 font-medium">Liên hệ</Link>

                        {user ? (
                            <div className="flex items-center space-x-4">

                                <Link to="/itinerary" className="text-white hover:text-blue-400 font-medium">
                                    Lịch trình
                                </Link>
                                {/* Nút Lịch sử đặt tour mới thêm */}
                                <Link to="/my-bookings" className="text-white hover:text-blue-300 font-medium">
                                    Đơn hàng của tôi
                                </Link>
                                {user.username === 'admin' && (
                                    <Link to="/admin-dashboard" className="text-purple-600 hover:text-purple-800 font-bold border border-purple-200 bg-purple-50 px-3 py-1 rounded-md">
                                        Bảng Điều Khiển
                                    </Link>
                                )}
                                <span className="text-white hidden md:block"> <b>Chào {user.username}</b></span>
                                <button onClick={logout} className="px-4 py-2 bg-orange-500 text-white rounded-2xl hover:bg-red-500 transition">
                                    Đăng xuất
                                </button>
                            </div>
                        ) : (
                            <>
                                <Link to="/login" className="text-white hover:text-blue-300 font-medium">Đăng nhập</Link>
                                <Link to="/register" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Đăng ký</Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;