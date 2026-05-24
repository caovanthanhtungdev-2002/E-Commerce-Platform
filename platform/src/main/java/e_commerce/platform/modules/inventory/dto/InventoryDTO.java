package e_commerce.platform.modules.inventory.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class InventoryDTO {
    private Long productId;
    private String productName;
    private String imageUrl;
    private Integer stock;
    private Integer reserved;
    private Integer sold;
}