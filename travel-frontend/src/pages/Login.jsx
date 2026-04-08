import React, { useState, useContext } from 'react';
import api from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useContext(AuthContext);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await api.post('auth/login/', {
                username,
                password
            });
            // Lưu token vào local storage qua hàm login của context
            login(response.data.access, response.data.refresh);
        } catch (err) {
            setError('Sai tài khoản hoặc mật khẩu!');
        }
    };

    return (
        <div className="max-w-md mx-auto mt-16 bg-white p-8 border rounded shadow-sm">
            <h2 className="text-2xl font-bold mb-6 text-center">Đăng nhập</h2>
            {error && <p className="text-red-500 mb-4">{error}</p>}
            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label className="block text-gray-700 mb-2">Tài khoản</label>
                    <input type="text" value={username} onChange={(e) => setUsername(e.target.value)}
                        className="w-full border px-3 py-2 rounded focus:outline-none focus:ring focus:border-blue-300" required />
                </div>
                <div className="mb-6">
                    <label className="block text-gray-700 mb-2">Mật khẩu</label>
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                        className="w-full border px-3 py-2 rounded focus:outline-none focus:ring focus:border-blue-300" required />
                </div>
                <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
                    Đăng nhập
                </button>
            </form>
            <p className="mt-4 text-center text-gray-600">
                Chưa có tài khoản? <Link to="/register" className="text-blue-600 hover:underline">Đăng ký ngay</Link>
            </p>
        </div>
    );
};

export default Login;