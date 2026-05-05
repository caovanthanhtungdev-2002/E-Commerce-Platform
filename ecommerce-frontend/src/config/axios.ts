import axios from 'axios';
import { useAuthStore } from '@/features/auth/store/authStore';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:8080',
});

// attach token
axiosInstance.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;

  console.log("TOKEN >>>", token);

  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// auto refresh
axiosInstance.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const { refreshToken } = useAuthStore.getState();

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
        useAuthStore.setState({
          user: null,
          accessToken: null,
          refreshToken: null,
        });

        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;