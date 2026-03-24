import axios from 'axios';

const api = axios.create({
    baseURL: '/api',
    withCredentials: true, // Crucial for receiving HttpOnly cookies (refreshToken)
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
                await axios.post('/api/auth/refresh', {}, { withCredentials: true });

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
