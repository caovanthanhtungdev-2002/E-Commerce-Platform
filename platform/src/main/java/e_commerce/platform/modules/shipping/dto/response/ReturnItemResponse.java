package e_commerce.platform.modules.shipping.dto.response;

import lombok.*;

import java.time.LocalDateTime;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ReturnItemResponse {

    private String id;
    private String returnId;
    private String orderItemId;
    private Integer quantity;
    private String reason;
    private LocalDateTime createdAt;
}
