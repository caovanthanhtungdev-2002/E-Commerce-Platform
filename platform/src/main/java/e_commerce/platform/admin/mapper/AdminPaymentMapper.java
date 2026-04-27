package e_commerce.platform.admin.mapper;

import e_commerce.platform.admin.dto.response.AdminPaymentResponse;
import e_commerce.platform.modules.payment.entity.Payment;

public class AdminPaymentMapper {

    // Payment entity dùng field 'provider' thay vì 'paymentMethod'
    // → map provider → paymentMethod
    public static AdminPaymentResponse toResponse(Payment payment) {
        if (payment == null) return null;

        return AdminPaymentResponse.builder()
                .id(payment.getId())
                .orderId(payment.getOrderId())
                .amount(payment.getAmount())
                .status(payment.getStatus())
                .transactionId(payment.getTransactionId())
                .paymentMethod(payment.getProvider()) 
                .createdAt(payment.getCreatedAt())
                .build();
    }
}