package e_commerce.platform.modules.shipping.dto.response;

import e_commerce.platform.modules.shipping.enums.TrackingEventStatus;
import lombok.*;

import java.time.LocalDateTime;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class TrackingEventResponse {

    private String id;
    private String shipmentId;
    private TrackingEventStatus status;
    private String location;
    private String description;
    private LocalDateTime eventTime;
    private LocalDateTime createdAt;
}
