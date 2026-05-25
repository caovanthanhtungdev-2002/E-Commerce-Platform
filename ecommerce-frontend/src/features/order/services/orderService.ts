import axios from "@/config/axios";
import type { Order, CreateOrderRequest } from "../types/orderTypes";

export const createOrder = async (payload: CreateOrderRequest) => {
  const res = await axios.post("/api/orders", payload);
  return res.data.data as Order;
};

export const getOrder = async (id: number) => {
  const res = await axios.get(`/api/orders/${id}`);
  return res.data.data as Order;
};

export const fetchOrders = async (): Promise<Order[]> => {
  const res = await axios.get("/api/orders");
  return res.data.data;
};

// ========================================
// UPDATE ORDER STATUS (khách xác nhận nhận hàng / trả hàng)
// ========================================
export const updateOrderStatus = async (
  id: number,
  status: string
) => {
  const res = await axios.patch(`/api/orders/${id}/status`, { status });
  return res.data.data as Order;
};