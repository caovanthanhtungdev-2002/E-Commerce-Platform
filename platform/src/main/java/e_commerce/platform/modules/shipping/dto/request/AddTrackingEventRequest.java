package e_commerce.platform.modules.shipping.dto.request;



import e_commerce.platform.modules.shipping.enums.TrackingEventStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDateTime;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class AddTrackingEventRequest {

    @NotNull(message = "Status is required")
    private TrackingEventStatus status;

    @NotBlank(message = "Location is required")
    private String location;

    @NotBlank(message = "Description is required")
    private String description;

    @NotNull(message = "Event time is required")
    private LocalDateTime eventTime;
}

