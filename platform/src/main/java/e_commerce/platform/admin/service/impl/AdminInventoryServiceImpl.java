package e_commerce.platform.admin.service.impl;

import e_commerce.platform.admin.service.AdminInventoryService;
import e_commerce.platform.exception.BadRequestException;
import e_commerce.platform.exception.ResourceNotFoundException;
import e_commerce.platform.modules.inventory.dto.InventoryDTO;
import e_commerce.platform.modules.inventory.entity.Inventory;
import e_commerce.platform.modules.inventory.repository.InventoryRepository;
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

    private InventoryDTO toDTO(Inventory inv) {
        return InventoryDTO.builder()
            .productId(inv.getProductId())
            .productName(inv.getProduct().getName())
            .imageUrl(inv.getProduct().getImageUrl())
            .stock(inv.getStock())
            .reserved(inv.getReserved())
            .sold(inv.getSold())
            .build();
    }

    private Inventory findById(Long productId) {
        if (productId == null) throw new BadRequestException("Product ID is required");
        return inventoryRepository.findByProductId(productId)
            .orElseThrow(() -> new ResourceNotFoundException("Inventory not found for product id: " + productId));
    }

    @Override
    public InventoryDTO getInventoryByProductId(Long productId) {
        return toDTO(findById(productId));
    }

    @Override
    public List<InventoryDTO> getAllInventories() {
        return inventoryRepository.findAllWithProduct()
            .stream()
            .map(this::toDTO)
            .toList();
    }

    @Override
    public List<InventoryDTO> getLowStockProducts() {
        return inventoryRepository.findByStockLessThan(LOW_STOCK_THRESHOLD)
            .stream()
            .map(this::toDTO)
            .toList();
    }

    @Override
    public void increaseStock(Long productId, int amount) {
        if (amount <= 0) throw new BadRequestException("Amount must be greater than 0");
        Inventory inv = findById(productId);
        inv.setStock((inv.getStock() != null ? inv.getStock() : 0) + amount);
        inventoryRepository.save(inv);
    }

    @Override
    public void decreaseStock(Long productId, int amount) {
        if (amount <= 0) throw new BadRequestException("Amount must be greater than 0");
        Inventory inv = findById(productId);
        int current  = inv.getStock()    != null ? inv.getStock()    : 0;
        int reserved = inv.getReserved() != null ? inv.getReserved() : 0;
        if (current < amount) throw new BadRequestException("Not enough stock. Current: " + current + ", requested: " + amount);
        if ((current - amount) < reserved) throw new BadRequestException("Cannot decrease below reserved quantity: " + reserved);
        inv.setStock(current - amount);
        inventoryRepository.save(inv);
    }

    @Override
    public void setStock(Long productId, int quantity) {
        if (quantity < 0) throw new BadRequestException("Stock cannot be negative");
        Inventory inv = findById(productId);
        int reserved = inv.getReserved() != null ? inv.getReserved() : 0;
        if (quantity < reserved) throw new BadRequestException("Cannot set stock less than reserved: " + reserved);
        inv.setStock(quantity);
        inventoryRepository.save(inv);
    }
}