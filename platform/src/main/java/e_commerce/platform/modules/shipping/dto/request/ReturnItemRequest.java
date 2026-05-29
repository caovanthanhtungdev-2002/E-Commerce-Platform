package e_commerce.platform.modules.shipping.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ReturnItemRequest {

    @NotBlank
    private String orderItemId;

    @NotNull @Min(1)
    private Integer quantity;

    @NotBlank
    private String reason;
}