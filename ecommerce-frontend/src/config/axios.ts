import axios from 'axios';
import { useAuthStore } from '@/features/auth/store/authStore';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:8080',
});

// Attach token nếu có
axiosInstance.interceptors.request.use((config) => {
  // Nếu đã có Authorization rồi thì không ghi đè
  if (config.headers?.Authorization) {
    return config;
  }
  
  const token = useAuthStore.getState().accessToken;

  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Auto refresh — theo logic Shopee: KHÔNG redirect tự động
axiosInstance.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const { refreshToken, accessToken } = useAuthStore.getState();

      // Nếu là guest (không có token gì cả) → bỏ qua, không làm gì
      if (!refreshToken && !accessToken) {
        return Promise.reject(error);
      }

      // Đã từng login → thử refresh
      try {
        const res = await axios.post(
          'http://localhost:8080/api/auth/refresh',
          { refreshToken }
        );

        const data = res.data.data;

        useAuthStore.setState({
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
        });

        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;

        return axiosInstance(originalRequest);
      } catch {
        // Refresh thất bại → clear session
        // KHÔNG redirect — để UI tự cập nhật qua state (giống Shopee)
        useAuthStore.setState({
          user: null,
          accessToken: null,
          refreshToken: null,
        });
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
