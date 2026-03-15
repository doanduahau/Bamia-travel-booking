import React, { createContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    // Kiểm tra token khi web vừa load
    useEffect(() => {
        const token = localStorage.getItem('access_token');
        if (token) {
            try {
                const decodedUser = jwtDecode(token);
                setUser(decodedUser);
            } catch (error) {
                console.error("Token không hợp lệ", error);
                logout();
            }
        }
    }, []);

    const login = (token) => {
        localStorage.setItem('access_token', token);
        const decodedUser = jwtDecode(token);
        setUser(decodedUser);
        navigate('/'); // Chuyển về trang chủ sau khi login
    };

    const logout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        setUser(null);
        navigate('/login');
    };

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};