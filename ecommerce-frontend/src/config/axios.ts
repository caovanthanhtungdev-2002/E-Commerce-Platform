import axios from 'axios';
import { useAuthStore } from '@/features/auth/store/authStore';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:8080',
});

// Attach token nếu có
axiosInstance.interceptors.request.use((config) => {
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

// Auto refresh
axiosInstance.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const { refreshToken, accessToken } = useAuthStore.getState();

      //Khách vãn lai (không có token) → bỏ qua hoàn toàn, không làm gì
      if (!refreshToken && !accessToken) {
        return Promise.reject(error);
      }

      // Đã login → kiểm tra có phải bị khóa không trước khi refresh
      const message: string = error.response?.data?.message ?? "";
      const isBlocked =
        message.includes("bị khóa") ||
        message.includes("blocked") ||
        message.includes("disabled");

      if (isBlocked) {
        // Bị khóa → KHÔNG refresh, clear session luôn
        useAuthStore.setState({
          user: null,
          accessToken: null,
          refreshToken: null,
        });
        alert("Tài khoản của bạn đã bị khóa. Vui lòng liên hệ admin.");
        window.location.href = "/login";
        return Promise.reject(error);
      }

      // Token hết hạn → thử refresh bình thường
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
        // Refresh thất bại → clear session, KHÔNG redirect 
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