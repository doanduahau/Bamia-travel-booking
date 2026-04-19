import React, { createContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    const decodePayload = (token) => {
        const payloadBase64Url = token.split('.')[1];
        if (!payloadBase64Url) return null;
        const payloadBase64 = payloadBase64Url.replace(/-/g, '+').replace(/_/g, '/');
        const padded = payloadBase64.padEnd(Math.ceil(payloadBase64.length / 4) * 4, '=');
        return JSON.parse(atob(padded));
    };

    const isExpired = (token) => {
        try {
            const payload = decodePayload(token);
            if (!payload?.exp) return false;
            return payload.exp * 1000 <= Date.now();
        } catch {
            return true;
        }
    };

    // Kiểm tra token khi web vừa load
    useEffect(() => {
        const token = localStorage.getItem('access_token');
        if (token) {
            try {
                if (isExpired(token)) {
                    logout();
                    return;
                }
                const decodedUser = jwtDecode(token);
                setUser(decodedUser);
            } catch (error) {
                console.error("Token không hợp lệ", error);
                logout();
            }
        }
    }, []);

    const login = (accessToken, refreshToken) => {
        localStorage.setItem('access_token', accessToken);
        if (refreshToken) {
            localStorage.setItem('refresh_token', refreshToken);
        }
        const decodedUser = jwtDecode(accessToken);
        setUser(decodedUser);
        navigate('/'); // Chuyển về trang chủ sau khi login
    };

    const logout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        setUser(null);
        navigate('/login');
    };

    const updateUser = (userData) => {
        setUser(prev => ({ ...prev, ...userData }));
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, updateUser }}>
            {children}
        </AuthContext.Provider>
    );
};