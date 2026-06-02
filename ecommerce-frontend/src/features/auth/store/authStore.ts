import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authService } from '../services/authService';

interface AuthState {
  user: any;
  accessToken: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  error: string | null;

  // ===== ACTIONS =====
  login: (data: any) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => Promise<void>;
  forgotPassword: (data: any) => Promise<void>;
  resetPassword: (data: any) => Promise<void>;
  setTokens: (accessToken: string, user: any) => void; // dùng cho OAuth2
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // ===== STATE =====
      user: null,
      accessToken: null,
      refreshToken: null,
      isLoading: false,
      error: null,

      // ===== LOGIN =====
      login: async (data) => {
        set({ isLoading: true, error: null });
        try {
          const result = await authService.login(data);
          set({
            user: result.user,
            accessToken: result.accessToken,
            refreshToken: result.refreshToken,
            isLoading: false,
          });
        } catch (err: any) {
          set({
            error: err?.response?.data?.message || 'Login failed',
            isLoading: false,
            accessToken: null,
            refreshToken: null,
            user: null,
          });
          throw err;
        }
      },

      // ===== REGISTER =====
      register: async (data) => {
        set({ isLoading: true, error: null });
        try {
          await authService.register(data);
          set({ isLoading: false });
        } catch (err: any) {
          set({
            error: err?.response?.data?.message || 'Register failed',
            isLoading: false,
          });
          throw err;
        }
      },

      // ===== LOGOUT =====
      logout: async () => {
        const { refreshToken } = get();
        try {
          if (refreshToken) {
            await authService.logout(refreshToken);
          }
        } catch (err) {
          console.log('Logout error:', err);
        }
        set({ user: null, accessToken: null, refreshToken: null });
      },

      // ===== FORGOT PASSWORD =====
      forgotPassword: async (data) => {
        try {
          await authService.forgotPassword(data);
        } catch (err: any) {
          set({ error: err?.response?.data?.message || 'Send OTP failed' });
        }
      },

      // ===== RESET PASSWORD =====
      resetPassword: async (data) => {
        try {
          await authService.resetPassword(data);
        } catch (err: any) {
          set({ error: err?.response?.data?.message || 'Reset failed' });
          throw err;
        }
      },

      // ===== SET TOKENS (OAuth2) =====
      // Được gọi từ OAuth2SuccessPage sau khi lấy được token từ URL
      setTokens: (accessToken: string, user: any) => {
        set({
          accessToken,
          refreshToken: null, // OAuth2 không trả refreshToken qua URL
          user,
          error: null,
        });
        // Đồng bộ vào localStorage để axiosInstance interceptor đọc được
        localStorage.setItem('accessToken', accessToken);
      },
    }),

    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
      }),
    }
  )
);