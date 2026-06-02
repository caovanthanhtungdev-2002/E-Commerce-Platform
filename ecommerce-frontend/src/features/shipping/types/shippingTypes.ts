
export type ShipmentStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PICKING_UP'
  | 'IN_TRANSIT'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'FAILED_DELIVERY'
  | 'RETURNED'
  | 'CANCELLED';

export type TrackingEventStatus =
  | 'ORDER_PLACED'
  | 'PICKED_UP'
  | 'IN_TRANSIT'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERY_ATTEMPTED'
  | 'DELIVERED'
  | 'RETURNED'
  | 'CANCELLED';

export type ReturnStatus =
  | 'PENDING'      
  | 'APPROVED'
  | 'REJECTED'
  | 'PROCESSING'  
  | 'COMPLETED'
  | 'CANCELLED';

export interface ShippingAddress {
  id: string;
  receiverName: string;
  receiverPhone: string;
  addressLine: string;
  ward: string;
  district: string;
  province: string;
  country: string;
  note?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TrackingEvent {
  id: string;
  shipmentId: string;
  status: TrackingEventStatus;
  location: string;
  description: string;
  eventTime: string;
  createdAt: string;
}

export interface Shipment {
  id: string;
  orderId: string;
  carrier: string;
  trackingNumber: string;
  status: ShipmentStatus;
  shippingFee: number;
  deliveredAt?: string;
  note?: string;
  shippingAddressId: string;
  shippingAddress?: ShippingAddress;
  trackingEvents?: TrackingEvent[];
  createdAt: string;
  updatedAt: string;
}

export interface ReturnItem {
  id: string;
  returnId: string;
  orderItemId: string;
  quantity: number;
  reason: string;
  createdAt: string;
}

export interface ReturnShipment {
  id: string;
  orderId: string;
  reason: string;
  status: ReturnStatus;
  refundAmount: number;
  carrier?: string;
  trackingNumber?: string;
  returnItems?: ReturnItem[];
  createdAt: string;
  updatedAt: string;
}

// ---- Request / Response DTOs ----

export interface CreateShipmentRequest {
  orderId: string;
  carrier: string;
  trackingNumber: string;
  shippingFee: number;
  shippingAddressId: string;
  note?: string;
}

export interface UpdateShipmentStatusRequest {
  status: ShipmentStatus;
  note?: string;
}

export interface AddTrackingEventRequest {
  status: TrackingEventStatus;
  location: string;
  description: string;
  eventTime: string;
}

export interface CreateReturnRequest {
  orderId: string;
  reason: string;
  refundAmount: number;
  returnItems: {
    orderItemId: string;
    quantity: number;
    reason: string;
  }[];
}

export interface ShipmentListParams {
  page?: number;
  size?: number;
  status?: ShipmentStatus;
  carrier?: string;
  orderId?: string;
  search?: string;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}