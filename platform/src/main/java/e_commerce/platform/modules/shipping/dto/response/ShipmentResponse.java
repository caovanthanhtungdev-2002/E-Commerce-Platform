package e_commerce.platform.modules.shipping.dto.response;



import  e_commerce.platform.modules.shipping.enums.ShipmentStatus;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ShipmentResponse {

    private String id;
    private String orderId;
    private String carrier;
    private String trackingNumber;
    private ShipmentStatus status;
    private BigDecimal shippingFee;
    private LocalDateTime deliveredAt;
    private String note;
    private String shippingAddressId;
    private ShippingAddressResponse shippingAddress;
    private List<TrackingEventResponse> trackingEvents;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}