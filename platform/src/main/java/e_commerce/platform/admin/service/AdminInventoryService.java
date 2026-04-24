 package e_commerce.platform.admin.service;
 
 import e_commerce.platform.modules.inventory.entity.Inventory;

            
import java.util.List;
public interface AdminInventoryService {

    Inventory getInventoryByProductId(Long productId);

        List<Inventory> getAllInventories();

            List<Inventory> getLowStockProducts();

                void increaseStock(Long productId, int amount);

                    void decreaseStock(Long productId, int amount);

                        void setStock(Long productId, int quantity);
                                        }
