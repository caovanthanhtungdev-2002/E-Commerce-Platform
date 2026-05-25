import { create } from "zustand";
import type { UserState, UpdateProfileRequest, ChangePasswordRequest, Address } from "../types/userTypes";
import { userService } from "../service/userService";

interface UserStore extends UserState {
  addresses: Address[];
  fetchProfile: () => Promise<void>;
  updateProfile: (data: UpdateProfileRequest) => Promise<void>;
  changePassword: (data: ChangePasswordRequest) => Promise<void>;
  uploadAvatar: (file: File) => Promise<void>;
  fetchAddresses: () => Promise<void>;
  addAddress: (data: Omit<Address, "id" | "createdAt">) => Promise<void>;
  updateAddress: (id: number, data: Omit<Address, "id" | "createdAt">) => Promise<void>;
  deleteAddress: (id: number) => Promise<void>;
  setDefaultAddress: (id: number) => Promise<void>;
  clearMessages: () => void;
}

export const useUserStore = create<UserStore>((set) => ({
  user: null,
  addresses: [],
  loading: false,
  error: null,
  successMessage: null,

  clearMessages: () => set({ error: null, successMessage: null }),

  fetchProfile: async () => {
    set({ loading: true, error: null });
    try {
      const user = await userService.getProfile();
      set({ user, loading: false });
    } catch (err: any) {
      set({ error: err?.response?.data?.message || "Failed to load profile", loading: false });
    }
  },

  updateProfile: async (data) => {
    set({ loading: true, error: null, successMessage: null });
    try {
      const user = await userService.updateProfile(data);
      set({ user, loading: false, successMessage: "Cập nhật thành công!" });
    } catch (err: any) {
      set({ error: err?.response?.data?.message || "Cập nhật thất bại", loading: false });
    }
  },

  changePassword: async (data) => {
    set({ loading: true, error: null, successMessage: null });
    try {
      await userService.changePassword(data);
      set({ loading: false, successMessage: "Đổi mật khẩu thành công!" });
    } catch (err: any) {
      set({ error: err?.response?.data?.message || "Đổi mật khẩu thất bại", loading: false });
    }
  },

  uploadAvatar: async (file) => {
    set({ loading: true, error: null, successMessage: null });
    try {
      const avatarUrl = await userService.uploadAvatar(file);
      set((state) => ({
        user: state.user ? { ...state.user, avatar: avatarUrl } : null,
        loading: false,
        successMessage: "Cập nhật avatar thành công!",
      }));
    } catch (err: any) {
      set({ error: err?.response?.data?.message || "Upload thất bại", loading: false });
    }
  },

  fetchAddresses: async () => {
    try {
      const addresses = await userService.getAddresses();
      set({ addresses });
    } catch (err: any) {
      set({ error: err?.response?.data?.message || "Lỗi tải địa chỉ" });
    }
  },

  addAddress: async (data) => {
    set({ loading: true, error: null });
    try {
      await userService.addAddress(data);
      const addresses = await userService.getAddresses();
      set({ addresses, loading: false, successMessage: "Thêm địa chỉ thành công!" });
    } catch (err: any) {
      set({ error: err?.response?.data?.message || "Thêm thất bại", loading: false });
    }
  },

  updateAddress: async (id, data) => {
    set({ loading: true, error: null });
    try {
      await userService.updateAddress(id, data);
      const addresses = await userService.getAddresses();
      set({ addresses, loading: false, successMessage: "Cập nhật địa chỉ thành công!" });
    } catch (err: any) {
      set({ error: err?.response?.data?.message || "Cập nhật thất bại", loading: false });
    }
  },

  deleteAddress: async (id) => {
    set({ loading: true, error: null });
    try {
      await userService.deleteAddress(id);
      const addresses = await userService.getAddresses();
      set({ addresses, loading: false, successMessage: "Xóa thành công!" });
    } catch (err: any) {
      set({ error: err?.response?.data?.message || "Xóa thất bại", loading: false });
    }
  },

  setDefaultAddress: async (id) => {
    try {
      await userService.setDefaultAddress(id);
      const addresses = await userService.getAddresses();
      set({ addresses, successMessage: "Đã đặt địa chỉ mặc định!" });
    } catch (err: any) {
      set({ error: err?.response?.data?.message || "Thất bại" });
    }
  },
}));