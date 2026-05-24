package e_commerce.platform.admin.controller;

import e_commerce.platform.admin.service.AdminInventoryService;
import e_commerce.platform.modules.inventory.dto.InventoryDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/inventory")
@RequiredArgsConstructor
public class AdminInventoryController {

    private final AdminInventoryService inventoryService;

    @GetMapping
    public List<InventoryDTO> getAll() {
        return inventoryService.getAllInventories();
    }

    @GetMapping("/product/{id}")
    public InventoryDTO getByProduct(@PathVariable Long id) {
        return inventoryService.getInventoryByProductId(id);
    }

    @GetMapping("/low-stock")
    public List<InventoryDTO> lowStock() {
        return inventoryService.getLowStockProducts();
    }

    @PatchMapping("/{id}/increase")
    public void increase(@PathVariable Long id, @RequestParam int amount) {
        inventoryService.increaseStock(id, amount);
    }

    @PatchMapping("/{id}/decrease")
    public void decrease(@PathVariable Long id, @RequestParam int amount) {
        inventoryService.decreaseStock(id, amount);
    }

    @PatchMapping("/{id}/set")
    public void set(@PathVariable Long id, @RequestParam int quantity) {
        inventoryService.setStock(id, quantity);
    }
}