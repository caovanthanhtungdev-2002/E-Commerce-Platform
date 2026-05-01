import axiosInstance from "@/config/axios";

export const userService = {
  async getProfile() {
    const res = await axiosInstance.get("/api/user/profile");
    return res.data.data;
  },

  async updateProfile(data: {
    fullName: string;
    phone?: string;
    address?: string;
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
};