import React, { useState } from 'react';
import api from '../api/axios';
import { useNavigate, Link } from 'react-router-dom';

const Register = () => {
    const [formData, setFormData] = useState({ username: '', email: '', password: '' });
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('auth/register/', formData);
            alert('Đăng ký thành công! Vui lòng đăng nhập.');
            navigate('/login');
        } catch (err) {
            setError('Có lỗi xảy ra, có thể tài khoản đã tồn tại.');
        }
    };

    return (
        <div className="h-screen flex bg-white overflow-hidden flex-row-reverse">
            {/* Right Image Section (reversed on Register) */}
            <div className="hidden lg:flex lg:w-1/2 relative bg-gray-900 group overflow-hidden">
                <img 
                    src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&q=80&w=2000" 
                    alt="Travel Background" 
                    className="absolute inset-0 w-full h-full object-cover opacity-80"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 via-gray-900/40 to-transparent"></div>
                <div className="absolute bottom-0 right-0 p-16 text-white z-10 w-full text-right">
                    <span className="inline-block py-1 px-3 rounded-full bg-[#005555]/20 border border-[#005555]/30 text-[#005555] text-sm font-medium tracking-wider mb-4 backdrop-blur-sm">
                        TRAVELBAMIA
                    </span>
                    <h2 className="text-5xl font-bold mb-6 font-serif leading-tight">Tham Gia <br/>Cùng Chúng Tôi</h2>
                    <p className="text-lg text-gray-300 mb-8 max-w-md ml-auto leading-relaxed">
                        Bắt đầu hành trình khám phá thế giới của riêng bạn ngay hôm nay. Trở thành một phần của cộng đồng du lịch bất tận.
                    </p>
                </div>
            </div>

            {/* Left Form Section */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 xl:p-24 h-full overflow-y-auto">
                <div className="w-full max-w-md">
                    <div className="text-center lg:text-left mb-10">
                        <Link to="/" className="inline-block lg:hidden mb-8 text-[#005555] font-bold text-2xl tracking-tighter">
                            TravelBaMia.
                        </Link>
                        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3 tracking-tight">Tạo tài khoản mới</h1>
                        <p className="text-gray-500 text-lg">Đăng ký để nhận những ưu đãi tuyệt vời nhất.</p>
                    </div>

                    {error && (
                        <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-sm border border-red-100 flex items-start animate-fade-in">
                            <svg className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"></path></svg>
                            <span>{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="group">
                            <label className="block text-sm font-medium text-gray-700 mb-2 group-focus-within:text-[#005555] transition-colors">
                                Tên tài khoản <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                </div>
                                <input 
                                    type="text" 
                                    name="username" 
                                    onChange={handleChange}
                                    className="w-full border border-gray-200 bg-gray-50 text-gray-900 pl-11 pr-4 py-3.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#005555]/50 focus:border-[#005555] transition-all focus:bg-white hover:border-gray-300"
                                    placeholder="Nhập tên tài khoản"
                                    required 
                                />
                            </div>
                        </div>
                        <div className="group">
                            <label className="block text-sm font-medium text-gray-700 mb-2 group-focus-within:text-[#005555] transition-colors">
                                Email liên hệ <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <input 
                                    type="email" 
                                    name="email" 
                                    onChange={handleChange}
                                    className="w-full border border-gray-200 bg-gray-50 text-gray-900 pl-11 pr-4 py-3.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#005555]/50 focus:border-[#005555] transition-all focus:bg-white hover:border-gray-300"
                                    placeholder="your@email.com"
                                    required 
                                />
                            </div>
                        </div>
                        <div className="group">
                            <label className="block text-sm font-medium text-gray-700 mb-2 group-focus-within:text-[#005555] transition-colors">
                                Mật khẩu <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                </div>
                                <input 
                                    type="password" 
                                    name="password" 
                                    onChange={handleChange}
                                    className="w-full border border-gray-200 bg-gray-50 text-gray-900 pl-11 pr-4 py-3.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#005555]/50 focus:border-[#005555] transition-all focus:bg-white hover:border-gray-300"
                                    placeholder="••••••••"
                                    required 
                                />
                            </div>
                        </div>
                        
                        <div className="pt-2">
                                <button 
                                    type="submit" 
                                    className="w-full bg-[#005555] hover:bg-[#004444] text-white font-semibold py-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#005555] transition-all shadow-lg shadow-[#005555]/30 transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center space-x-2"
                                >
                                <span>Tạo tài khoản ngay</span>
                                <svg className="w-5 h-5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                </svg>
                            </button>
                        </div>
                        
                        <p className="text-sm text-gray-500 text-center mt-4">
                            Bằng cách đăng ký, bạn đồng ý với <a href="#" className="text-[#007777] hover:underline">Điều khoản dịch vụ</a> và <a href="#" className="text-[#007777] hover:underline">Chính sách bảo mật</a> của chúng tôi.
                        </p>
                    </form>

                    <div className="mt-8 pt-8 border-t border-gray-200">
                        <p className="text-center text-gray-600">
                            Đã có tài khoản?{' '}
                            <Link to="/login" className="font-semibold text-[#005555] hover:text-[#004444] hover:underline transition-all">
                                Đăng nhập ngay
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;