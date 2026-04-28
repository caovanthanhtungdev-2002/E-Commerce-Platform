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
 login: (data: LoginRequest) => {
  console.log('LOGIN DATA:', data); 
  return axiosInstance.post('/api/auth/login', data);
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