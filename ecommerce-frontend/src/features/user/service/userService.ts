import axiosInstance from "@/config/axios";
import type { Address } from "../types/userTypes";

export const userService = {
  async getProfile() {
    const res = await axiosInstance.get("/api/user/profile");
    return res.data.data;
  },

  async updateProfile(data: {
    fullName: string;
    phone?: string;
    bio?: string;
  }) {
    const res = await axiosInstance.put("/api/user/profile", data);
    return res.data.data;
  },

  async changePassword(data: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }) {
    await axiosInstance.post("/api/user/change-password", data);
  },

  async uploadAvatar(file: File): Promise<string> {
    const formData = new FormData();
    formData.append("file", file);

    const res = await axiosInstance.post("/api/user/avatar", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return res.data.data;
  },
  // ===== ADDRESS =====
  async getAddresses(): Promise<Address[]> {
    const res = await axiosInstance.get("/api/user/addresses");
    return res.data.data;
  },

  async addAddress(data: Omit<Address, "id" | "createdAt">) {
    const res = await axiosInstance.post("/api/user/addresses", data);
    return res.data.data;
  },

  async updateAddress(id: number, data: Omit<Address, "id" | "createdAt">) {
    const res = await axiosInstance.put(`/api/user/addresses/${id}`, data);
    return res.data.data;
  },

  async deleteAddress(id: number) {
    await axiosInstance.delete(`/api/user/addresses/${id}`);
  },

  async setDefaultAddress(id: number) {
    await axiosInstance.patch(`/api/user/addresses/${id}/default`);
  },
};