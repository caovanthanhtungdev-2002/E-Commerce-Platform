import { create } from "zustand";
import type { UserState, UpdateProfileRequest, ChangePasswordRequest } from "../types/userTypes";
import { userService } from "../service/userService";

interface UserStore extends UserState {
  fetchProfile: () => Promise<void>;
  updateProfile: (data: UpdateProfileRequest) => Promise<void>;
  changePassword: (data: ChangePasswordRequest) => Promise<void>;
  uploadAvatar: (file: File) => Promise<void>;
  clearMessages: () => void;
}

export const useUserStore = create<UserStore>((set) => ({
  user: null,
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
  console.log("PROFILE ERROR:", err);
  set({
    error: err?.response?.data?.message || err.message || "Failed to load profile",
    loading: false
  });
}
  },

  updateProfile: async (data) => {
    set({ loading: true, error: null, successMessage: null });
    try {
      const user = await userService.updateProfile(data);
      set({ user, loading: false, successMessage: "Profile updated successfully!" });
    } catch (err: any) {
      set({ error: err?.response?.data?.message || "Update failed", loading: false });
    }
  },

  changePassword: async (data) => {
    set({ loading: true, error: null, successMessage: null });
    try {
      await userService.changePassword(data);
      set({ loading: false, successMessage: "Password changed successfully!" });
    } catch (err: any) {
      set({ error: err?.response?.data?.message || "Change password failed", loading: false });
    }
  },

  uploadAvatar: async (file) => {
    set({ loading: true, error: null, successMessage: null });
    try {
      const avatarUrl = await userService.uploadAvatar(file);
      set((state) => ({
        user: state.user ? { ...state.user, avatar: avatarUrl } : null,
        loading: false,
        successMessage: "Avatar updated!",
      }));
    } catch (err: any) {
      set({ error: err?.response?.data?.message || "Upload failed", loading: false });
    }
  },
}));