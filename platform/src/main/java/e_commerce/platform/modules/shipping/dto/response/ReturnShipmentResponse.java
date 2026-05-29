package e_commerce.platform.modules.shipping.dto.response;



import e_commerce.platform.modules.shipping.enums.ReturnStatus;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ReturnShipmentResponse {

    private String id;
    private String orderId;
    private String reason;
    private ReturnStatus status;
    private BigDecimal refundAmount;
    private String carrier;
    private String trackingNumber;
    private String note;
    private List<ReturnItemResponse> returnItems;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
