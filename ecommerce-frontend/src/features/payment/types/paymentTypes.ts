export interface CreatePaymentResponse {
  paymentUrl: string;
}

export type PaymentMethod = "VNPAY" | "COD";