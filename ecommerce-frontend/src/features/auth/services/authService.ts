import axiosInstance from '@/config/axios';
import type {
  LoginRequest,
  RegisterRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  RefreshRequest,
  ApiResponse,
  AuthResponse,
  UserResponse,
} from '../types/auth.types';

export const authService = {
login: async (data: LoginRequest) => {
  const res = await axiosInstance.post('/api/auth/login', data);

  const {
    accessToken,
    refreshToken,
    user,
  } = res.data.data;

  // lưu token
  localStorage.setItem("accessToken", accessToken);
  localStorage.setItem("refreshToken", refreshToken);

  return {
    accessToken,
    refreshToken,
    user,
  };
},

  register: (data: RegisterRequest) =>
    axiosInstance.post<ApiResponse<UserResponse>>('/api/auth/register', data),

  refresh: (data: RefreshRequest) =>
    axiosInstance.post<ApiResponse<AuthResponse>>('/api/auth/refresh', data),

  logout: (refreshToken: string) =>
    axiosInstance.post('/api/auth/logout', { refreshToken }),

  forgotPassword: (data: ForgotPasswordRequest) =>
    axiosInstance.post('/api/auth/forgot-password', data),

  resetPassword: (data: ResetPasswordRequest) =>
    axiosInstance.post('/api/auth/reset-password', data),
};