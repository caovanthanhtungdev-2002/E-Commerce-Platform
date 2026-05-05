import axios from "@/config/axios";
import type { Order } from "../types/orderTypes";

export const createOrder = async (couponCode?: string) => {
  const res = await axios.post("/api/orders", {
    couponCode,
  });

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