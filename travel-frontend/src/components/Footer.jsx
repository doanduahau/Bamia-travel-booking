import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Facebook, Instagram, Twitter, Youtube, ChevronRight } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-gray-300 mt-auto">
            {/* Phần nội dung chính của Footer */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">

                    {/* Cột 1: Logo & Mô tả */}
                    <div className="space-y-6">
                        <Link to="/" className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
                            <span className="text-blue-500">Travel</span>BaMia
                        </Link>
                        <p className="text-gray-400 leading-relaxed text-sm">
                            Đồng hành cùng bạn trên mọi nẻo đường. Chúng tôi cung cấp các trải nghiệm du lịch tuyệt vời nhất với mức giá hợp lý và dịch vụ tận tâm 24/7.
                        </p>
                    </div>

                    {/* Cột 2: Quick Links */}
                    <div>
                        <h3 className="text-lg font-bold text-white mb-6 relative inline-block">
                            Liên kết nhanh
                            <span className="absolute -bottom-2 left-0 w-1/2 h-1 bg-blue-500 rounded-full"></span>
                        </h3>
                        <ul className="space-y-4">
                            {['Trang chủ', 'Tours', 'Điểm đến', 'Contact'].map((item, index) => (
                                <li key={index}>
                                    <Link to={item === 'Trang chủ' ? '/' : `/${item.toLowerCase()}`} className="flex items-center group hover:text-white transition-colors text-sm">
                                        <ChevronRight className="w-4 h-4 mr-2 text-blue-500 opacity-0 group-hover:opacity-100 transform -translate-x-2 group-hover:translate-x-0 transition-all" />
                                        <span className="transform group-hover:translate-x-1 transition-transform">{item}</span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Cột 3: Support */}
                    <div>
                        <h3 className="text-lg font-bold text-white mb-6 relative inline-block">
                            Hỗ trợ
                            <span className="absolute -bottom-2 left-0 w-1/2 h-1 bg-blue-500 rounded-full"></span>
                        </h3>
                        <ul className="space-y-4">
                            {['FAQ', 'Trung tâm trợ giúp', 'Điều khoản sử dụng', 'Chính sách bảo mật'].map((item, index) => (
                                <li key={index}>
                                    <Link to="#" className="flex items-center group hover:text-white transition-colors text-sm">
                                        <ChevronRight className="w-4 h-4 mr-2 text-blue-500 opacity-0 group-hover:opacity-100 transform -translate-x-2 group-hover:translate-x-0 transition-all" />
                                        <span className="transform group-hover:translate-x-1 transition-transform">{item}</span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Cột 4: Contact */}
                    <div>
                        <h3 className="text-lg font-bold text-white mb-6 relative inline-block">
                            Liên hệ
                            <span className="absolute -bottom-2 left-0 w-1/2 h-1 bg-blue-500 rounded-full"></span>
                        </h3>
                        <ul className="space-y-5">
                            <li className="flex items-start gap-3">
                                <MapPin className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                                <span className="text-sm text-gray-400">123 Đường Du Lịch, Quận 1, TP. Hồ Chí Minh, Việt Nam</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Phone className="w-5 h-5 text-blue-500 flex-shrink-0" />
                                <span className="text-sm text-gray-400">+84 123 456 789</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Mail className="w-5 h-5 text-blue-500 flex-shrink-0" />
                                <span className="text-sm text-gray-400">support@travelvi.com</span>
                            </li>
                        </ul>
                    </div>

                </div>
            </div>

            {/* Phần Copyright và Social Media */}
            <div className="border-t border-gray-800 bg-gray-950">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-sm text-gray-500 text-center md:text-left">
                        © 2026 TravelVi. All rights reserved. Xây dựng bởi Senior Fullstack Dev.
                    </p>

                    <div className="flex items-center gap-4">
                        {[Facebook, Instagram, Twitter, Youtube].map((Icon, index) => (
                            <a
                                key={index}
                                href="#"
                                className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 hover:bg-blue-600 hover:text-white hover:-translate-y-1 transition-all duration-300 shadow-lg"
                            >
                                <Icon className="w-5 h-5" />
                            </a>
                        ))}
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;