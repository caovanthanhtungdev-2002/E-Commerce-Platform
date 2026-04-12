package e_commerce.platform.modules.inventory.service;

public interface InventoryService {

    void createInventory(Long productId, Integer stock);

    void decreaseStock(Long productId, Integer quantity);

    void increaseStock(Long productId, Integer quantity);
    
    void reserveStock(Long productId, Integer quantity);

    void confirmOrder(Long productId, Integer quantity);

    void releaseStock(Long productId, Integer quantity);
}