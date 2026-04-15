import React, { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const location = useLocation();

    // Hàm kiểm tra link active
    const isActive = (path) => location.pathname === path;

    // Class style cho link
    const linkClass = (path) => `
        inline-flex h-10 min-w-[110px] items-center justify-center rounded-full px-3
        transition-all duration-300 font-semibold text-sm tracking-wide
        ${isActive(path) ? 'text-white' : 'text-white/60 hover:text-white'}
    `;

    const userTextClass = 'inline-flex h-10 items-center justify-center rounded-full px-3 text-sm font-semibold tracking-wide text-white/70 whitespace-nowrap';

    return (
        <nav className="absolute top-6 inset-x-0 mx-auto w-[95%] max-w-7xl z-50 transition-all duration-500">
            <div className="bg-[#005555]/80 backdrop-blur-xl border border-white/10 rounded-full px-8 shadow-2xl">
                <div className="flex justify-between h-16 items-center">
                    <div className="flex items-center">
                        <Link to="/" className="text-2xl font-extrabold text-white tracking-tighter">
                            Travel<span className="text-orange-400">BaMia</span>
                        </Link>
                    </div>
                    
                    <div className="hidden md:flex items-center gap-2">
                        <Link to="/" className={linkClass('/')}>Trang chủ</Link>
                        <Link to="/tours" className={linkClass('/tours')}>Tours</Link>
                        <Link to="/contact" className={linkClass('/contact')}>Liên hệ</Link>

                        {user ? (
                            <div className="flex items-center gap-2 pl-2">
                                <Link to="/itinerary" className={linkClass('/itinerary')}>
                                    Lịch trình
                                </Link>
                                <Link to="/my-bookings" className={linkClass('/my-bookings')}>
                                    Đơn hàng
                                </Link>
                                <div className="flex items-center gap-2">
                                    <span className={userTextClass}>Chào, <b className="text-white ml-1">{user.username}</b></span>
                                    <button 
                                        onClick={logout} 
                                        className="inline-flex h-10 min-w-[110px] items-center justify-center bg-orange-500 px-3 text-sm font-semibold tracking-wide text-white rounded-full hover:bg-orange-600 transition-all shadow-lg transform hover:scale-105 active:scale-95"
                                    >
                                        Đăng xuất
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 pl-2">
                                <Link to="/login" className={linkClass('/login')}>Đăng nhập</Link>
                                <Link to="/register" className="inline-flex h-10 min-w-[110px] items-center justify-center bg-orange-500 px-3 text-sm font-semibold tracking-wide text-white rounded-full hover:bg-orange-600 shadow-md transition-all transform hover:scale-105 active:scale-95">Đăng ký</Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;