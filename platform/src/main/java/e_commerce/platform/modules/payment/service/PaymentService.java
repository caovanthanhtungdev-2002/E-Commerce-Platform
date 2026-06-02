package e_commerce.platform.modules.payment.service;

import java.util.Map;

import e_commerce.platform.modules.payment.dto.response.CreatePaymentResponse;

public interface PaymentService {

    CreatePaymentResponse createPayment(Long orderId);

    String handleVNPayCallback(Map<String, String> params);

     void confirmCOD(Long orderId);
}