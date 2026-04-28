package e_commerce.platform.admin.mapper;

import e_commerce.platform.admin.dto.response.AdminPaymentResponse;
import e_commerce.platform.modules.payment.entity.Payment;
import e_commerce.platform.modules.payment.enums.PaymentMethod;

public class AdminPaymentMapper {

    public static AdminPaymentResponse toResponse(Payment payment) {
        if (payment == null) return null;

        return AdminPaymentResponse.builder()
                .id(payment.getId())
                .orderId(payment.getOrderId())
                .amount(payment.getAmount())
                .status(payment.getStatus())
                .transactionId(payment.getTransactionId())
                .paymentMethod(mapProvider(payment.getProvider()))
                .createdAt(payment.getCreatedAt())
                .build();
    }

    private static String mapProvider(PaymentMethod provider) {
        return provider != null ? provider.name() : "UNKNOWN";
    }
}