package e_commerce.platform.payment.service;

import e_commerce.platform.payment.dto.response.CreatePaymentResponse;
import java.util.Map;

public interface PaymentService {

    CreatePaymentResponse createPayment(Long orderId);

    String handleVNPayCallback(Map<String, String> params);
}