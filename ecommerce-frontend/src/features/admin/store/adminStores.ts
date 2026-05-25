import { create } from "zustand";
import { adminProductService } from "../services/adminProductService";
import { adminCategoryService } from "../services/adminCategoryService";
import { adminOrderService } from "../services/adminOrderService";
import {
  adminUserService,
  adminCouponService,
  adminInventoryService,
} from "../services/adminOtherServices";
import type {
  AdminProduct,
  AdminCreateProductRequest,
  AdminUpdateProductRequest,
  AdminProductFilter,
  AdminCategory,
  CreateCategoryRequest,
  UpdateCategoryRequest,
  AdminOrder,
  OrderStatus,
  AdminUser,
  AdminCoupon,
  CreateCouponRequest,
  UpdateCouponRequest,
  AdminInventory,
  PageResponse,
} from "../types/adminTypes";

// ========== PRODUCT STORE ==========
interface AdminProductState {
  page: PageResponse<AdminProduct> | null;
  loading: boolean;
  fetch: (filter?: AdminProductFilter, page?: number, size?: number) => Promise<void>;
  create: (data: AdminCreateProductRequest) => Promise<void>;
  update: (id: number, data: AdminUpdateProductRequest) => Promise<void>;
  remove: (id: number) => Promise<void>;
}

export const useAdminProductStore = create<AdminProductState>((set) => ({
  page: null,
  loading: false,

  fetch: async (filter = {}, page = 0, size = 20) => {
    set({ loading: true });
    try {
      const data = await adminProductService.getAll(filter, page, size);
      set({ page: data });
    } finally {
      set({ loading: false });
    }
  },

  create: async (data) => {
    await adminProductService.create(data);
  },

  update: async (id, data) => {
    await adminProductService.update(id, data);
  },

  remove: async (id) => {
    await adminProductService.delete(id);
  },
}));

// ========== CATEGORY STORE ==========
interface AdminCategoryState {
  page: PageResponse<AdminCategory> | null;
  loading: boolean;
  fetch: (page?: number, size?: number) => Promise<void>;
  create: (data: CreateCategoryRequest) => Promise<void>;
  update: (id: number, data: UpdateCategoryRequest) => Promise<void>;
  remove: (id: number) => Promise<void>;
}

export const useAdminCategoryStore = create<AdminCategoryState>((set) => ({
  page: null,
  loading: false,

  fetch: async (page = 0, size = 20) => {
    set({ loading: true });
    try {
      const data = await adminCategoryService.getAll(page, size);
      set({ page: data });
    } finally {
      set({ loading: false });
    }
  },

  create: async (data) => {
    await adminCategoryService.create(data);
  },

  update: async (id, data) => {
    await adminCategoryService.update(id, data);
  },

  remove: async (id) => {
    await adminCategoryService.delete(id);
  },
}));

// ========== ORDER STORE ==========
interface AdminOrderState {
  orders: AdminOrder[];
  loading: boolean;
  fetch: (page?: number, size?: number) => Promise<void>;
  filter: (params: { status?: OrderStatus; username?: string; from?: string; to?: string }) => Promise<void>;
  updateStatus: (id: number, status: OrderStatus) => Promise<void>;
  confirm: (id: number) => Promise<void>;  
  process: (id: number) => Promise<void>;
ship: (id: number) => Promise<void>;
deliver: (id: number) => Promise<void>;
  cancel: (id: number, reason: string) => Promise<void>;
  refund: (id: number) => Promise<void>;
  remove: (id: number) => Promise<void>;
}

export const useAdminOrderStore = create<AdminOrderState>((set) => ({
  orders: [],
  loading: false,

  fetch: async (page = 0, size = 20) => {
    set({ loading: true });
    try {
      const data = await adminOrderService.getAll(page, size);
      set({ orders: data });
    } finally {
      set({ loading: false });
    }
  },

  filter: async (params) => {
    set({ loading: true });
    try {
      const data = await adminOrderService.filter(params);
      set({ orders: data });
    } finally {
      set({ loading: false });
    }
  },

  updateStatus: async (id, status) => {
    await adminOrderService.updateStatus(id, status);
  },

  confirm: async (id) => {          // ← THÊM
    await adminOrderService.confirm(id);
  },

  cancel: async (id, reason) => {
    await adminOrderService.cancel(id, reason);
  },

  refund: async (id) => {
    await adminOrderService.refund(id);
  },

  remove: async (id) => {
    await adminOrderService.delete(id);
  },

  process: async (id) => {
  await adminOrderService.process(id);
},

ship: async (id) => {
  await adminOrderService.ship(id);
},

deliver: async (id) => {
  await adminOrderService.deliver(id);
},
}));

// ========== USER STORE ==========
interface AdminUserState {
  users: AdminUser[];
  loading: boolean;
  fetch: (page?: number, size?: number) => Promise<void>;
  block: (id: number) => Promise<void>;
  activate: (id: number) => Promise<void>;
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

  block: async (id) => { await adminUserService.block(id); },
  activate: async (id) => { await adminUserService.activate(id); },
  remove: async (id) => { await adminUserService.delete(id); },
}));

// ========== COUPON STORE ==========
interface AdminCouponState {
  coupons: AdminCoupon[];
  loading: boolean;
  fetch: () => Promise<void>;
  create: (data: CreateCouponRequest) => Promise<void>;
  update: (id: number, data: UpdateCouponRequest) => Promise<void>;
  enable: (id: number) => Promise<void>;
  disable: (id: number) => Promise<void>;
  remove: (id: number) => Promise<void>;
}

export const useAdminCouponStore = create<AdminCouponState>((set) => ({
  coupons: [],
  loading: false,

  fetch: async () => {
    set({ loading: true });
    try {
      const data = await adminCouponService.getAll();
      set({ coupons: data });
    } finally {
      set({ loading: false });
    }
  },

  create: async (data) => { await adminCouponService.create(data); },
  update: async (id, data) => { await adminCouponService.update(id, data); },
  enable: async (id) => { await adminCouponService.enable(id); },
  disable: async (id) => { await adminCouponService.disable(id); },
  remove: async (id) => { await adminCouponService.delete(id); },
}));

// ========== INVENTORY STORE ==========
interface AdminInventoryState {
  inventories: AdminInventory[];
  loading: boolean;
  fetch: () => Promise<void>;
  fetchLowStock: () => Promise<void>;
  increase: (id: number, amount: number) => Promise<void>;
  decrease: (id: number, amount: number) => Promise<void>;
  set: (id: number, quantity: number) => Promise<void>;
}

export const useAdminInventoryStore = create<AdminInventoryState>((set) => ({
  inventories: [],
  loading: false,

  fetch: async () => {
    set({ loading: true });
    try {
      const data = await adminInventoryService.getAll();
      set({ inventories: data });
    } finally {
      set({ loading: false });
    }
  },

  fetchLowStock: async () => {
    set({ loading: true });
    try {
      const data = await adminInventoryService.getLowStock();
      set({ inventories: data });
    } finally {
      set({ loading: false });
    }
  },

  increase: async (id, amount) => { await adminInventoryService.increase(id, amount); },
  decrease: async (id, amount) => { await adminInventoryService.decrease(id, amount); },
  set: async (id, quantity) => { await adminInventoryService.set(id, quantity); },
}));