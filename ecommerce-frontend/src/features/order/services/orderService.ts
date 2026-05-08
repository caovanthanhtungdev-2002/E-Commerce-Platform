import axios from "@/config/axios";

import type { Order, CreateOrderRequest }
  from "../types/orderTypes";

// ========================================
// CREATE ORDER
// ========================================

export const createOrder = async (
  payload: CreateOrderRequest
) => {

  const res = await axios.post(
    "/api/orders",
    payload
  );

  return res.data.data as Order;
};

// ========================================
// GET ORDER
// ========================================

export const getOrder = async (id: number) => {

  const res = await axios.get(
    `/api/orders/${id}`
  );

  return res.data.data as Order;
};

// ========================================
// GET MY ORDERS
// ========================================

export const fetchOrders =
  async (): Promise<Order[]> => {

    const res = await axios.get("/api/orders");

    return res.data.data;
  };