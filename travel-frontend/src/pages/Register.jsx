import React, { useState } from 'react';
import api from '../api/axios';
import { useNavigate, Link } from 'react-router-dom';
import PageBanner from '../components/PageBanner';

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
        <div className="bg-gray-50 min-h-screen pb-20">
            <PageBanner 
                title="Tham Gia Cùng Chúng Tôi"
                subtitle="Bắt đầu hành trình khám phá thế giới của riêng bạn ngay hôm nay."
                image="https://images.unsplash.com/photo-1516738901171-8eb4fc13bd20?auto=format&fit=crop&q=80&w=2000"
            />
            
            <div className="max-w-md mx-auto -mt-10 md:-mt-12 relative z-10 bg-white p-8 border border-gray-100 rounded-2xl shadow-xl">
            {error && <p className="text-red-500 mb-4">{error}</p>}
            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label className="block text-gray-700 mb-2">Tài khoản</label>
                    <input type="text" name="username" onChange={handleChange}
                        className="w-full border px-3 py-2 rounded focus:outline-none" required />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700 mb-2">Email</label>
                    <input type="email" name="email" onChange={handleChange}
                        className="w-full border px-3 py-2 rounded focus:outline-none" required />
                </div>
                <div className="mb-6">
                    <label className="block text-gray-700 mb-2">Mật khẩu</label>
                    <input type="password" name="password" onChange={handleChange}
                        className="w-full border px-3 py-2 rounded focus:outline-none" required />
                </div>
                <button type="submit" className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700">
                    Đăng ký
                </button>
            </form>
            <p className="mt-4 text-center text-gray-600">
                Đã có tài khoản? <Link to="/login" className="text-blue-600 hover:underline">Đăng nhập</Link>
            </p>
        </div>
        </div>
    );
};

export default Register;