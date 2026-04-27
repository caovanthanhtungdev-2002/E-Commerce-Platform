package e_commerce.platform.admin.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AdminRefundRequest {

    @NotNull
    private Long paymentId;

    private String reason;
}