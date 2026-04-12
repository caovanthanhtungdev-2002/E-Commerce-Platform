package e_commerce.platform.modules.inventory.service.impl;

import e_commerce.platform.exception.BadRequestException;
import e_commerce.platform.exception.ResourceNotFoundException;
import e_commerce.platform.modules.inventory.entity.Inventory;
import e_commerce.platform.modules.inventory.repository.InventoryRepository;
import e_commerce.platform.modules.inventory.service.InventoryService;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class InventoryServiceImpl implements InventoryService {

    private final InventoryRepository inventoryRepository;

    @Override
    public void createInventory(Long productId, Integer stock) {

        Inventory inventory = Inventory.builder()
                .productId(productId)
                .stock(stock)
                .reserved(0)
                .sold(0)
                .build();

        inventoryRepository.save(inventory);
    }

    //CHỐNG OVERSELL
    @Override
    @Transactional
    public void decreaseStock(Long productId, Integer quantity) {

        Inventory inventory = inventoryRepository.findByProductId(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Inventory not found"));

        if (inventory.getStock() < quantity) {
            throw new BadRequestException("Out of stock");
        }

        inventory.setStock(inventory.getStock() - quantity);
        inventory.setSold(inventory.getSold() + quantity);

        inventoryRepository.save(inventory);
    }

    @Override
    @Transactional
    public void increaseStock(Long productId, Integer quantity) {

        Inventory inventory = inventoryRepository.findByProductId(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Inventory not found"));

        inventory.setStock(inventory.getStock() + quantity);

        inventoryRepository.save(inventory);
    }
}