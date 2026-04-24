package e_commerce.platform.admin.service.impl;

import e_commerce.platform.admin.service.AdminInventoryService;

import e_commerce.platform.modules.inventory.entity.Inventory;
import e_commerce.platform.modules.inventory.repository.InventoryRepository;

import e_commerce.platform.exception.ResourceNotFoundException;
import e_commerce.platform.exception.BadRequestException;

import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class AdminInventoryServiceImpl implements AdminInventoryService {

    private final InventoryRepository inventoryRepository;

    private static final int LOW_STOCK_THRESHOLD = 10;

    // ================= GET BY PRODUCT ID =================
    @Override
    public Inventory getInventoryByProductId(Long productId) {

        if (productId == null) {
            throw new BadRequestException("Product ID is required");
        }

        return inventoryRepository.findByProductId(productId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Inventory not found for product id: " + productId));
    }

    // ================= GET ALL =================
    @Override
    public List<Inventory> getAllInventories() {
        return inventoryRepository.findAll();
    }

    // ================= LOW STOCK =================
    @Override
    public List<Inventory> getLowStockProducts() {
        // query thẳng DB thay vì load toàn bộ rồi filter trong memory
        return inventoryRepository.findByStockLessThan(LOW_STOCK_THRESHOLD);
    }

    // ================= INCREASE STOCK =================
    @Override
    public void increaseStock(Long productId, int amount) {

        if (amount <= 0) {
            throw new BadRequestException("Amount must be greater than 0");
        }

        Inventory inventory = getInventoryByProductId(productId);

        int current = inventory.getStock() != null ? inventory.getStock() : 0;
        inventory.setStock(current + amount);
    }

    // ================= DECREASE STOCK =================
    @Override
    public void decreaseStock(Long productId, int amount) {

        if (amount <= 0) {
            throw new BadRequestException("Amount must be greater than 0");
        }

        Inventory inventory = getInventoryByProductId(productId);

        int current = inventory.getStock() != null ? inventory.getStock() : 0;

        if (current < amount) {
            throw new BadRequestException(
                    "Not enough stock. Current: " + current + ", requested: " + amount);
        }

        // kiểm tra không được giảm xuống dưới số lượng đang reserved
        int reserved = inventory.getReserved() != null ? inventory.getReserved() : 0;
        if ((current - amount) < reserved) {
            throw new BadRequestException(
                    "Cannot decrease below reserved quantity: " + reserved);
        }

        inventory.setStock(current - amount);
    }

    // ================= SET STOCK =================
    @Override
    public void setStock(Long productId, int quantity) {

        if (quantity < 0) {
            throw new BadRequestException("Stock cannot be negative");
        }

        Inventory inventory = getInventoryByProductId(productId);

        // kiểm tra không được set thấp hơn reserved
        int reserved = inventory.getReserved() != null ? inventory.getReserved() : 0;
        if (quantity < reserved) {
            throw new BadRequestException(
                    "Stock cannot be less than reserved quantity: " + reserved);
        }

        inventory.setStock(quantity);
    }
}
