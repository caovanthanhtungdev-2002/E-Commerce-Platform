package e_commerce.platform.modules.shipping.dto.request;

import e_commerce.platform.modules.shipping.enums.ShipmentStatus;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class UpdateShipmentStatusRequest {

    @NotNull(message = "Status is required")
    private ShipmentStatus status;

    private String note;
}