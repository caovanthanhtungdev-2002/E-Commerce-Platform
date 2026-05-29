package e_commerce.platform.modules.shipping.dto.request;



import e_commerce.platform.modules.shipping.enums.ReturnStatus;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class UpdateReturnStatusRequest {

    @NotNull(message = "Status is required")
    private ReturnStatus status;

    private String note;
}
