
import axiosInstance from '@/config/axios';
import type {
  Shipment,
  ShipmentListParams,
  CreateShipmentRequest,
  UpdateShipmentStatusRequest,
  AddTrackingEventRequest,
  TrackingEvent,
  ReturnShipment,
  CreateReturnRequest,
  PageResponse,
  ApiResponse,           // ← import từ shippingTypes
} from '../types/shippingTypes';

export const shippingService = {

  // ---- Shipments ----

  async getShipments(params: ShipmentListParams = {}): Promise<PageResponse<Shipment>> {
    const res = await axiosInstance.get<ApiResponse<PageResponse<Shipment>>>(
      '/api/shipments', { params }
    );
    return res.data.data;
  },

  async getShipmentById(id: string): Promise<Shipment> {
    const res = await axiosInstance.get<ApiResponse<Shipment>>(`/api/shipments/${id}`);
    return res.data.data;
  },

  async getShipmentByOrder(orderId: string): Promise<Shipment> {
    const res = await axiosInstance.get<ApiResponse<Shipment>>(`/api/shipments/order/${orderId}`);
    return res.data.data;
  },

  async createShipment(body: CreateShipmentRequest): Promise<Shipment> {
    const res = await axiosInstance.post<ApiResponse<Shipment>>('/api/shipments', body);
    return res.data.data;
  },

  async updateShipmentStatus(id: string, body: UpdateShipmentStatusRequest): Promise<Shipment> {
    const res = await axiosInstance.patch<ApiResponse<Shipment>>(
      `/api/shipments/${id}/status`, body
    );
    return res.data.data;
  },

  async deleteShipment(id: string): Promise<void> {
    await axiosInstance.delete(`/api/shipments/${id}`);
  },

  // ---- Tracking ----

  async getTrackingEvents(shipmentId: string): Promise<TrackingEvent[]> {
    const res = await axiosInstance.get<ApiResponse<TrackingEvent[]>>(
      `/api/shipments/${shipmentId}/tracking`
    );
    return res.data.data;
  },

  async addTrackingEvent(
    shipmentId: string,
    body: AddTrackingEventRequest
  ): Promise<TrackingEvent> {
    const res = await axiosInstance.post<ApiResponse<TrackingEvent>>(
      `/api/shipments/${shipmentId}/tracking`, body
    );
    return res.data.data;
  },

  // ---- Returns ----

  async getReturns(
    params: { page?: number; size?: number; status?: string } = {}
  ): Promise<PageResponse<ReturnShipment>> {
    const res = await axiosInstance.get<ApiResponse<PageResponse<ReturnShipment>>>(
      '/api/returns', { params }
    );
    return res.data.data;
  },

  async getReturnById(id: string): Promise<ReturnShipment> {
    const res = await axiosInstance.get<ApiResponse<ReturnShipment>>(`/api/returns/${id}`);
    return res.data.data;
  },

  async createReturn(body: CreateReturnRequest): Promise<ReturnShipment> {
    const res = await axiosInstance.post<ApiResponse<ReturnShipment>>('/api/returns', body);
    return res.data.data;
  },

  async updateReturnStatus(
    id: string,
    status: 'APPROVED' | 'REJECTED' | 'COMPLETED' | 'CANCELLED',
    note?: string
  ): Promise<ReturnShipment> {
    const res = await axiosInstance.patch<ApiResponse<ReturnShipment>>(
      `/api/returns/${id}/status`, { status, note }
    );
    return res.data.data;
  },
};