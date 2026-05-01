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
}

/**
 *  useAuthStore: store chính quản lý auth
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // ===== STATE =====
      user: null,
      accessToken: null,
      refreshToken: null,
      isLoading: false,
      error: null,

      /**
       * LOGIN
       * gọi API login → lưu token + user
       */
      login: async (data) => {
  set({ isLoading: true, error: null });

  try {
    const res = await authService.login(data);

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

      /**
       * REGISTER
       * gọi API đăng ký
       */
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

          throw err; // để page xử lý tiếp (alert, navigate)
        }
      },

      /**
       *LOGOUT
       * gọi API logout + clear store
       */
      logout: async () => {
        const { refreshToken } = get();

        try {
          if (refreshToken) {
            await authService.logout(refreshToken);
          }
        } catch (err) {
          console.log('Logout error:', err);
        }

        // reset toàn bộ state
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
        });
      },

      /**
       * FORGOT PASSWORD
       * gửi email nhận OTP
       */
      forgotPassword: async (data) => {
        try {
          await authService.forgotPassword(data);
        } catch (err: any) {
          set({
            error: err?.response?.data?.message || 'Send OTP failed',
          });
        }
      },

      /**
       *RESET PASSWORD
       * nhập OTP + password mới
       */
      resetPassword: async (data) => {
        try {
          await authService.resetPassword(data);
        } catch (err: any) {
          set({
            error: err?.response?.data?.message || 'Reset failed',
            
          });

          throw err;
        }
      },
    }),

    /**
     *PERSIST (localStorage)
     * giúp reload vẫn giữ login
     */
    {
      name: 'auth-storage',

      // chỉ lưu những field cần thiết
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
      }),
    }
  )
);