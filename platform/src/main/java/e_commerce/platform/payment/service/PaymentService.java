package e_commerce.platform.payment.service;

import e_commerce.platform.payment.dto.response.CreatePaymentResponse;

public interface PaymentService {

    CreatePaymentResponse createPayment(Long orderId);

    void handleCallback(String transactionId, boolean success);
}