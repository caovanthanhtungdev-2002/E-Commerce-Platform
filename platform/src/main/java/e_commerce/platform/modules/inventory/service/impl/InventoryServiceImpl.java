package e_commerce.platform.modules.inventory.service.impl;

import e_commerce.platform.exception.BadRequestException;
import e_commerce.platform.exception.ResourceNotFoundException;
import e_commerce.platform.modules.inventory.entity.Inventory;
import e_commerce.platform.modules.inventory.repository.InventoryRepository;
import e_commerce.platform.modules.inventory.service.InventoryService;
import e_commerce.platform.modules.product.entity.Product;
import e_commerce.platform.modules.product.repository.ProductRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class InventoryServiceImpl implements InventoryService {

    private final InventoryRepository inventoryRepository;
    private final ProductRepository productRepository; 

    @Override
    public void createInventory(Long productId, Integer stock) {

        if (stock == null || stock < 0) {
            throw new BadRequestException("Invalid stock");
        }

        // lấy product từ DB
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        //  check tránh tạo duplicate inventory
        if (inventoryRepository.existsById(productId)) {
            throw new BadRequestException("Inventory already exists");
        }

        Inventory inventory = Inventory.builder()
                .product(product) 
                .stock(stock)
                .reserved(0)
                .sold(0)
                .build();

        inventoryRepository.save(inventory);
    }

    // ================= CHỐNG OVERSELL =================
    @Override
    @Transactional
    public void decreaseStock(Long productId, Integer quantity) {

        for (int i = 0; i < 3; i++) {

            try {
                Inventory inventory = inventoryRepository.findByProductId(productId)
                        .orElseThrow(() -> new ResourceNotFoundException("Inventory not found"));

                if (inventory.getStock() < quantity) {
                    throw new BadRequestException("Out of stock");
                }

                inventory.setStock(inventory.getStock() - quantity);
                inventory.setSold(inventory.getSold() + quantity);

                inventoryRepository.save(inventory);
                return;

            } catch (org.springframework.orm.ObjectOptimisticLockingFailureException e) {
                if (i == 2) {
                    throw new RuntimeException("Concurrent update failed");
                }
            }
        }
    }

    @Override
    @Transactional
    public void increaseStock(Long productId, Integer quantity) {

        Inventory inventory = inventoryRepository.findByProductId(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Inventory not found"));

        inventory.setStock(inventory.getStock() + quantity);

        inventoryRepository.save(inventory);
    }

    @Override
    @Transactional
    public void reserveStock(Long productId, Integer quantity) {

        Inventory inventory = inventoryRepository.findByProductId(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Inventory not found"));

        int available = inventory.getStock() - inventory.getReserved();

        if (available < quantity) {
            throw new BadRequestException("Not enough stock");
        }

        inventory.setReserved(inventory.getReserved() + quantity);

        inventoryRepository.save(inventory);
    }

    @Override
    @Transactional
    public void confirmOrder(Long productId, Integer quantity) {

        Inventory inventory = inventoryRepository.findByProductId(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Inventory not found"));

        if (inventory.getReserved() < quantity) {
            throw new BadRequestException("Invalid reserved state");
        }

        inventory.setReserved(inventory.getReserved() - quantity);
        inventory.setStock(inventory.getStock() - quantity);
        inventory.setSold(inventory.getSold() + quantity);

        inventoryRepository.save(inventory);
    }

    @Override
    @Transactional
    public void releaseStock(Long productId, Integer quantity) {

        Inventory inventory = inventoryRepository.findByProductId(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Inventory not found"));

        if (inventory.getReserved() < quantity) {
            throw new BadRequestException("Invalid reserved state");
        }

        inventory.setReserved(inventory.getReserved() - quantity);

        inventoryRepository.save(inventory);
    }
}