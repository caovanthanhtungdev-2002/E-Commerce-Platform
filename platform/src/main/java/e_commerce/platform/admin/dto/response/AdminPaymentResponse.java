package e_commerce.platform.admin.dto.response;

import e_commerce.platform.modules.payment.enums.PaymentStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class AdminPaymentResponse {

    private Long id;

    private Long orderId;

    private Double amount;

    private PaymentStatus status;

    private String transactionId;

    private String paymentMethod;

    private LocalDateTime createdAt;
}