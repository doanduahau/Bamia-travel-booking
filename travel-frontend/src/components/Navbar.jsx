import React, { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const location = useLocation();

    // Hàm kiểm tra link active
    const isActive = (path) => location.pathname === path;

    const isLogin = location.pathname === '/login';
    const isRegister = location.pathname === '/register';
    const isAuthPage = isLogin || isRegister;

    // Class style cho link
    const linkClass = (path) => `
        inline-flex h-10 min-w-auto lg:min-w-[90px] xl:min-w-[110px] items-center justify-center rounded-full px-3
        transition-all duration-300 font-semibold text-sm tracking-wide
        ${isActive(path) ? 'text-white' : 'text-white/60 hover:text-white'}
    `;

    const userTextClass = 'inline-flex h-10 items-center justify-center rounded-full px-2 lg:px-3 text-sm font-semibold tracking-wide text-white/70 whitespace-nowrap';

    let navClasses = "absolute top-6 inset-x-0 mx-auto w-[95%] max-w-7xl z-50";
    
    if (isLogin) {
        navClasses = "absolute top-6 inset-x-0 mx-auto lg:inset-x-auto lg:left-8 lg:mx-0 w-[95%] lg:w-[calc(50%-64px)] z-50";
    } else if (isRegister) {
        navClasses = "absolute top-6 inset-x-0 mx-auto lg:inset-x-auto lg:right-8 lg:mx-0 w-[95%] lg:w-[calc(50%-64px)] z-50";
    }

    return (
        <nav className={navClasses}>
            <div className={`bg-[#005555]/80 backdrop-blur-xl border border-white/10 rounded-full px-6 lg:px-8 shadow-2xl ${isAuthPage ? 'lg:py-0' : ''}`}>
                <div className="flex justify-between h-16 items-center">
                    <div className="flex items-center">
                        <Link to="/" className="text-xl lg:text-2xl font-extrabold text-white tracking-tighter shrink-0">
                            Travel<span className="text-orange-400">BaMia</span>
                        </Link>
                    </div>
                    
                    <div className="hidden md:flex items-center gap-1 xl:gap-2">
                        <Link to="/" className={linkClass('/')}>Trang chủ</Link>
                        <Link to="/tours" className={linkClass('/tours')}>Tours</Link>
                        <Link to="/contact" className={linkClass('/contact')}>Liên hệ</Link>

                        {user ? (
                            <div className="flex items-center gap-1 xl:gap-2 pl-1 lg:pl-2">
                                <Link to="/itinerary" className={linkClass('/itinerary')}>
                                    Lịch trình
                                </Link>
                                <Link to="/my-bookings" className={linkClass('/my-bookings')}>
                                    Đơn hàng
                                </Link>
                                <div className="flex items-center gap-1 lg:gap-2">
                                    <span className={userTextClass}>Chào, 
                                        <Link to="/profile" className="text-white ml-1 truncate max-w-[80px] lg:max-w-none hover:text-orange-400 transition-colors duration-200 cursor-pointer">
                                            <b className="font-bold">{user.username}</b>
                                        </Link>
                                    </span>
                                    <button 
                                        onClick={logout} 
                                        className="inline-flex h-10 min-w-auto lg:min-w-[100px] items-center justify-center bg-orange-500 px-3 text-sm font-semibold tracking-wide text-white rounded-full hover:bg-orange-600 transition-all shadow-lg transform active:scale-95 shrink-0"
                                    >
                                        Đăng xuất
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 pl-2">
                                {!isLogin && (
                                    <Link to="/login" className={linkClass('/login')}>Đăng nhập</Link>
                                )}
                                {!isRegister && (
                                    <Link to="/register" className="inline-flex h-10 min-w-[110px] items-center justify-center bg-orange-500 px-3 text-sm font-semibold tracking-wide text-white rounded-full hover:bg-orange-600 shadow-md transition-all transform active:scale-95">Đăng ký</Link>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;