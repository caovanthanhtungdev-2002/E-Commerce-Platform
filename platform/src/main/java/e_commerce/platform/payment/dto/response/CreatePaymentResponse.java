package e_commerce.platform.payment.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class CreatePaymentResponse {

    private String paymentUrl;
}