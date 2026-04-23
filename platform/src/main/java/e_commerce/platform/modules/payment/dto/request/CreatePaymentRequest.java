package e_commerce.platform.modules.payment.dto.request;

import lombok.Data;

@Data
public class CreatePaymentRequest {
    private Long orderId;
    private Long amount;
}
