
import { create } from 'zustand';
import { shippingService } from '../services/shippingService';
import type {
  Shipment,
  ShipmentListParams,
  ReturnShipment,
  TrackingEvent,
  CreateShipmentRequest,
  UpdateShipmentStatusRequest,
  AddTrackingEventRequest,
  CreateReturnRequest,
  PageResponse,
} from '../types/shippingTypes';

interface ShippingState {
  shipments: PageResponse<Shipment> | null;
  currentShipment: Shipment | null;
  trackingEvents: TrackingEvent[];
  returns: PageResponse<ReturnShipment> | null;
  currentReturn: ReturnShipment | null;
  loading: boolean;
  error: string | null;

  fetchShipments: (params?: ShipmentListParams) => Promise<void>;
  fetchShipment: (id: string) => Promise<void>;
  fetchShipmentByOrder: (orderId: string) => Promise<void>;
  createShipment: (body: CreateShipmentRequest) => Promise<Shipment>;
  updateShipmentStatus: (id: string, body: UpdateShipmentStatusRequest) => Promise<void>;
  deleteShipment: (id: string) => Promise<void>;

  fetchTrackingEvents: (shipmentId: string) => Promise<void>;
  addTrackingEvent: (shipmentId: string, body: AddTrackingEventRequest) => Promise<void>;

  fetchReturns: (params?: { page?: number; size?: number; status?: string }) => Promise<void>;
  fetchReturn: (id: string) => Promise<void>;
  createReturn: (body: CreateReturnRequest) => Promise<ReturnShipment>;
  updateReturnStatus: (
    id: string,
    status: 'APPROVED' | 'REJECTED' | 'COMPLETED' | 'CANCELLED',
    note?: string
  ) => Promise<void>;

  clearError: () => void;
  reset: () => void;
}

const initialState = {
  shipments: null,
  currentShipment: null,
  trackingEvents: [],
  returns: null,
  currentReturn: null,
  loading: false,
  error: null,
};

export const useShippingStore = create<ShippingState>((set, get) => ({
  ...initialState,

  clearError: () => set({ error: null }),
  reset: () => set(initialState),

  // ---- Shipments ----

  fetchShipments: async (params) => {
    set({ loading: true, error: null });
    try {
      const data = await shippingService.getShipments(params);
      set({ shipments: data });
    } catch (e: any) {
      set({ error: e.response?.data?.message ?? 'Failed to fetch shipments' });
    } finally {
      set({ loading: false });
    }
  },

  fetchShipment: async (id) => {
    set({ loading: true, error: null });
    try {
      const data = await shippingService.getShipmentById(id); // ← fix: getShipment → getShipmentById
      set({ currentShipment: data });
    } catch (e: any) {
      set({ error: e.response?.data?.message ?? 'Failed to fetch shipment' });
    } finally {
      set({ loading: false });
    }
  },

  fetchShipmentByOrder: async (orderId) => {
    set({ loading: true, error: null });
    try {
      const data = await shippingService.getShipmentByOrder(orderId);
      set({ currentShipment: data });
    } catch (e: any) {
      set({ error: e.response?.data?.message ?? 'No shipment found for order' });
    } finally {
      set({ loading: false });
    }
  },

  createShipment: async (body) => {
    set({ loading: true, error: null });
    try {
      const data = await shippingService.createShipment(body);
      const prev = get().shipments;
      if (prev) {
        set({
          shipments: {
            ...prev,
            content: [data, ...prev.content],
            totalElements: prev.totalElements + 1,
          },
        });
      }
      return data;
    } catch (e: any) {
      const msg = e.response?.data?.message ?? 'Failed to create shipment';
      set({ error: msg });
      throw new Error(msg);
    } finally {
      set({ loading: false });
    }
  },

  updateShipmentStatus: async (id, body) => {
    set({ loading: true, error: null });
    try {
      const updated = await shippingService.updateShipmentStatus(id, body); // ← fix: updateStatus → updateShipmentStatus
      const prev = get().shipments;
      if (prev) {
        set({
          shipments: {
            ...prev,
            content: prev.content.map((s) => (s.id === id ? updated : s)),
          },
        });
      }
      if (get().currentShipment?.id === id) set({ currentShipment: updated });
    } catch (e: any) {
      set({ error: e.response?.data?.message ?? 'Failed to update status' });
    } finally {
      set({ loading: false });
    }
  },

  deleteShipment: async (id) => {
    set({ loading: true, error: null });
    try {
      await shippingService.deleteShipment(id);
      const prev = get().shipments;
      if (prev) {
        set({
          shipments: {
            ...prev,
            content: prev.content.filter((s) => s.id !== id),
            totalElements: prev.totalElements - 1,
          },
        });
      }
    } catch (e: any) {
      set({ error: e.response?.data?.message ?? 'Failed to delete shipment' });
    } finally {
      set({ loading: false });
    }
  },

  // ---- Tracking ----

  fetchTrackingEvents: async (shipmentId) => {
    set({ loading: true, error: null });
    try {
      const data = await shippingService.getTrackingEvents(shipmentId);
      set({ trackingEvents: data });
    } catch (e: any) {
      set({ error: e.response?.data?.message ?? 'Failed to fetch tracking events' });
    } finally {
      set({ loading: false });
    }
  },

  addTrackingEvent: async (shipmentId, body) => {
    set({ loading: true, error: null });
    try {
      const event = await shippingService.addTrackingEvent(shipmentId, body);
      set((s) => ({ trackingEvents: [event, ...s.trackingEvents] }));
    } catch (e: any) {
      set({ error: e.response?.data?.message ?? 'Failed to add tracking event' });
    } finally {
      set({ loading: false });
    }
  },

  // ---- Returns ----

  fetchReturns: async (params) => {
    set({ loading: true, error: null });
    try {
      const data = await shippingService.getReturns(params);
      set({ returns: data });
    } catch (e: any) {
      set({ error: e.response?.data?.message ?? 'Failed to fetch returns' });
    } finally {
      set({ loading: false });
    }
  },

  fetchReturn: async (id) => {
    set({ loading: true, error: null });
    try {
      const data = await shippingService.getReturnById(id); // ← fix: getReturn → getReturnById
      set({ currentReturn: data });
    } catch (e: any) {
      set({ error: e.response?.data?.message ?? 'Failed to fetch return' });
    } finally {
      set({ loading: false });
    }
  },

  createReturn: async (body) => {
    set({ loading: true, error: null });
    try {
      const data = await shippingService.createReturn(body);
      const prev = get().returns;
      if (prev) {
        set({
          returns: {
            ...prev,
            content: [data, ...prev.content],
            totalElements: prev.totalElements + 1,
          },
        });
      }
      return data;
    } catch (e: any) {
      const msg = e.response?.data?.message ?? 'Failed to create return';
      set({ error: msg });
      throw new Error(msg);
    } finally {
      set({ loading: false });
    }
  },

  updateReturnStatus: async (id, status, note) => {
    set({ loading: true, error: null });
    try {
      const updated = await shippingService.updateReturnStatus(id, status, note);
      const prev = get().returns;
      if (prev) {
        set({
          returns: {
            ...prev,
            content: prev.content.map((r) => (r.id === id ? updated : r)),
          },
        });
      }
      if (get().currentReturn?.id === id) set({ currentReturn: updated });
    } catch (e: any) {
      set({ error: e.response?.data?.message ?? 'Failed to update return status' });
    } finally {
      set({ loading: false });
    }
  },
}));