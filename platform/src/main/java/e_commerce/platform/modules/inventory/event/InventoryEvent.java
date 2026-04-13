package e_commerce.platform.modules.inventory.event;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InventoryEvent {

    private Long productId;
    private Integer quantity;
    private String type; // RESERVE / CONFIRM / RELEASE
}