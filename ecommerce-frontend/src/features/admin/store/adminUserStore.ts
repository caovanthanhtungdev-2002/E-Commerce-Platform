import { create } from "zustand";
import { adminUserService } from "../services/adminUserService";
import type { AdminUser } from "../types/adminTypes";

interface AdminUserState {
  users: AdminUser[];
  loading: boolean;
  fetch: (page?: number, size?: number) => Promise<void>;
  block: (id: number) => Promise<void>;
  activate: (id: number) => Promise<void>;
  assignRole: (id: number, role: string) => Promise<void>;
  removeRole: (id: number) => Promise<void>;
  remove: (id: number) => Promise<void>;
}

export const useAdminUserStore = create<AdminUserState>((set) => ({
  users: [],
  loading: false,

  fetch: async (page = 0, size = 20) => {
    set({ loading: true });
    try {
      const data = await adminUserService.getAll(page, size);
      set({ users: data });
    } finally {
      set({ loading: false });
    }
  },

  block:      async (id)        => { await adminUserService.block(id); },
  activate:   async (id)        => { await adminUserService.activate(id); },
  assignRole: async (id, role)  => { await adminUserService.assignRole(id, role); },
  removeRole: async (id)        => { await adminUserService.removeRole(id); },
  remove:     async (id)        => { await adminUserService.delete(id); },
}));