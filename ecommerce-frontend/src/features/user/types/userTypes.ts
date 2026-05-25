export interface User {
  id: string;
  username: string;
  email: string;
  fullName: string;
  phone?: string;
  bio?: string;
  avatar?: string;
  role: "USER" | "ADMIN";
  createdAt: string;
  updatedAt: string;
}

export interface UpdateProfileRequest {
  fullName: string;
  phone?: string;
  bio?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface UserState {
  user: User | null;
  loading: boolean;
  error: string | null;
  successMessage: string | null;
}
export interface Address {
  id: number;
  receiverName: string;
  receiverPhone: string;
  addressLine: string;
  ward: string;
  district: string;
  province: string;
  postalCode?: string;
  country?: string;
  isDefault: boolean;
  createdAt: string;
}