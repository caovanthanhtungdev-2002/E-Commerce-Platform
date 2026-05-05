import axiosInstance from "@/config/axios";


export const confirmVNPayCallback = async (params: Record<string, string>) => {
  const query = new URLSearchParams(params).toString();
  const res = await axiosInstance.get(`/api/payments/vnpay/callback?${query}`);
  return res.data;
};

export const createPayment = async (orderId: number) => {
  const res = await axiosInstance.post(`/api/payments/${orderId}`);
  return res.data.data;
};