package e_commerce.platform.admin.service;

import e_commerce.platform.modules.inventory.dto.InventoryDTO;
import java.util.List;

public interface AdminInventoryService {
    InventoryDTO getInventoryByProductId(Long productId);
    List<InventoryDTO> getAllInventories();
    List<InventoryDTO> getLowStockProducts();
    void increaseStock(Long productId, int amount);
    void decreaseStock(Long productId, int amount);
    void setStock(Long productId, int quantity);
}