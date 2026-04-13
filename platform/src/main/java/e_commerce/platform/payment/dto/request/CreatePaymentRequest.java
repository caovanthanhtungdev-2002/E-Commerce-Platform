package e_commerce.platform.payment.dto.request;

import lombok.Data;

@Data
public class CreatePaymentRequest {
    private Long orderId;
    private Long amount;
}
