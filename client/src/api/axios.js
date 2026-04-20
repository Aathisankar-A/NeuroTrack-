import axios from 'axios';

// In development, Vite's proxy forwards /api → http://localhost:5000/api
// In production (Vercel), VITE_API_BASE_URL must be set to your backend URL
// e.g. https://neurotrack-api.onrender.com
const BASE_URL = import.meta.env.VITE_API_BASE_URL
    ? `${import.meta.env.VITE_API_BASE_URL}/api`
    : '/api';

const api = axios.create({
    baseURL: BASE_URL,
    withCredentials: true, // Crucial for receiving HttpOnly cookies (refreshToken)
    timeout: 15000, // 15 second timeout — accounts for cold starts on free-tier backends
});

// Response interceptor for handling token refresh
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // If 401 and we haven't tried refreshing yet
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                // Attempt to rotate tokens via the refresh endpoint
                await axios.post(`${BASE_URL}/auth/refresh`, {}, { withCredentials: true });

                // Retry the original request
                return api(originalRequest);
            } catch (refreshError) {
                // If refresh fails, the user is truly logged out
                window.dispatchEvent(new CustomEvent('auth:logout'));
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default api;
