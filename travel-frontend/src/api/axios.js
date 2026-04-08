import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api/';

// Tạo một instance của axios với baseURL trỏ tới Django server
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

const decodeJwtPayload = (token) => {
    const payloadBase64Url = token.split('.')[1];
    if (!payloadBase64Url) return null;

    const payloadBase64 = payloadBase64Url.replace(/-/g, '+').replace(/_/g, '/');
    const padded = payloadBase64.padEnd(Math.ceil(payloadBase64.length / 4) * 4, '=');
    return JSON.parse(atob(padded));
};

const isTokenExpired = (token) => {
    try {
        const payload = decodeJwtPayload(token);
        if (!payload) return true;
        if (!payload.exp) return false;
        return payload.exp * 1000 <= Date.now();
    } catch (error) {
        return true;
    }
};

// Interceptor: Trước khi gửi request, kiểm tra xem có token trong localStorage không
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('access_token');
        if (token && !isTokenExpired(token)) {
            config.headers['Authorization'] = `Bearer ${token}`;
        } else if (token) {
            // Token hỏng/hết hạn -> xóa để tránh gửi Authorization gây 401 cho endpoint public
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            delete config.headers['Authorization'];
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config || {};
        const status = error?.response?.status;

        if (status === 401 && !originalRequest._retryWithRefresh) {
            originalRequest._retryWithRefresh = true;

            const refresh = localStorage.getItem('refresh_token');
            if (refresh) {
                try {
                    const refreshResponse = await axios.post(`${API_BASE_URL}auth/token/refresh/`, { refresh });
                    const newAccess = refreshResponse.data?.access;
                    if (newAccess) {
                        localStorage.setItem('access_token', newAccess);
                        originalRequest.headers = originalRequest.headers || {};
                        originalRequest.headers.Authorization = `Bearer ${newAccess}`;
                        return api(originalRequest);
                    }
                } catch (refreshError) {
                    // refresh thất bại -> xử lý bên dưới
                }
            }

            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');

            const method = (originalRequest.method || '').toLowerCase();
            if (method === 'get' && !originalRequest._retryWithoutAuth) {
                originalRequest._retryWithoutAuth = true;
                if (originalRequest.headers) {
                    delete originalRequest.headers.Authorization;
                }
                return api(originalRequest);
            }
        }

        return Promise.reject(error);
    }
);

export default api;