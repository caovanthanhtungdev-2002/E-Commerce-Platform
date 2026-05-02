// e_commerce/platform/admin/service/impl/AdminProductServiceImpl.java
package e_commerce.platform.admin.service.impl;

import e_commerce.platform.admin.dto.request.AdminCreateProductRequest;
import e_commerce.platform.admin.dto.request.AdminProductFilterRequest;
import e_commerce.platform.admin.dto.request.AdminUpdateProductRequest;
import e_commerce.platform.admin.dto.response.AdminProductResponse;
import e_commerce.platform.admin.mapper.AdminProductMapper;
import e_commerce.platform.admin.service.AdminProductService;
import e_commerce.platform.admin.spec.AdminProductSpecification;
import e_commerce.platform.cache.redis.RedisKey;
import e_commerce.platform.cache.redis.RedisService;
import e_commerce.platform.exception.BadRequestException;
import e_commerce.platform.exception.ResourceNotFoundException;
import e_commerce.platform.modules.audit.service.AuditService;
import e_commerce.platform.modules.category.entity.Category;
import e_commerce.platform.modules.category.repository.CategoryRepository;
import e_commerce.platform.modules.inventory.service.InventoryService;
import e_commerce.platform.modules.product.entity.Product;
import e_commerce.platform.modules.product.entity.ProductStatus;
import e_commerce.platform.modules.product.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AdminProductServiceImpl implements AdminProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final InventoryService inventoryService;
    private final RedisService redisService;
    private final AuditService auditService;

    private String getCurrentAdmin() {
        return SecurityContextHolder.getContext().getAuthentication().getName();
    }

    // ── CREATE ───────────────────────────────────────────────────
    @Override
    @Transactional
    public AdminProductResponse create(AdminCreateProductRequest request) {
        String admin = getCurrentAdmin();

        Category category = findActiveCategory(request.getCategoryId());

        Product product = Product.builder()
                .name(request.getName())
                .description(request.getDescription())
                .price(request.getPrice())
                .imageUrl(request.getImageUrl())
                .status(ProductStatus.ACTIVE)
                .category(category)
                .createdAt(LocalDateTime.now())
                .createdBy(admin)
                .build();

        productRepository.save(product);
        inventoryService.createInventory(product.getId(), request.getStock());

        redisService.delete(RedisKey.productList());
        auditService.log(admin, "ADMIN_CREATE_PRODUCT", product.getName());

        return AdminProductMapper.toResponse(product);
    }

    // ── GET ALL ──────────────────────────────────────────────────
    @Override
    public Page<AdminProductResponse> getAll(AdminProductFilterRequest filter, int page, int size) {
        size = Math.min(size, 100);
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());

        return productRepository
                .findAll(AdminProductSpecification.filter(filter), pageable)
                .map(AdminProductMapper::toResponse);
    }

    // ── GET BY ID ────────────────────────────────────────────────
    @Override
    public AdminProductResponse getById(Long id) {
        return AdminProductMapper.toResponse(findProduct(id));
    }

    // ── UPDATE ───────────────────────────────────────────────────
    @Override
    @Transactional
    public AdminProductResponse update(Long id, AdminUpdateProductRequest request) {
        String admin = getCurrentAdmin();
        Product product = findProduct(id);

        if (product.getStatus() == ProductStatus.DELETED) {
            throw new BadRequestException("Cannot update a deleted product");
        }

        if (request.getName() != null)        product.setName(request.getName());
        if (request.getDescription() != null) product.setDescription(request.getDescription());
        if (request.getImageUrl() != null)    product.setImageUrl(request.getImageUrl());
        if (request.getStatus() != null) {
            if (request.getStatus() == ProductStatus.DELETED) {
                throw new BadRequestException("Use DELETE endpoint to remove a product");
            }
            product.setStatus(request.getStatus());
        }
        if (request.getPrice() != null) {
            if (request.getPrice() <= 0) throw new BadRequestException("Price must be > 0");
            product.setPrice(request.getPrice());
        }
        if (request.getCategoryId() != null) {
            product.setCategory(findActiveCategory(request.getCategoryId()));
        }

        product.setUpdatedAt(LocalDateTime.now());
        product.setUpdatedBy(admin);
        productRepository.save(product);

        redisService.delete(RedisKey.product(id));
        redisService.delete(RedisKey.productList());
        auditService.log(admin, "ADMIN_UPDATE_PRODUCT", product.getName());

        return AdminProductMapper.toResponse(product);
    }

    // ── DELETE (soft) ────────────────────────────────────────────
    @Override
    @Transactional
    public void delete(Long id) {
        String admin = getCurrentAdmin();
        Product product = findProduct(id);

        if (product.getStatus() == ProductStatus.DELETED) {
            throw new BadRequestException("Product already deleted");
        }

        product.setStatus(ProductStatus.DELETED);
        product.setUpdatedAt(LocalDateTime.now());
        product.setUpdatedBy(admin);
        productRepository.save(product);

        redisService.delete(RedisKey.product(id));
        redisService.delete(RedisKey.productList());
        auditService.log(admin, "ADMIN_DELETE_PRODUCT", product.getName());
    }

    // ── HELPERS ──────────────────────────────────────────────────
    private Product findProduct(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
    }

    private Category findActiveCategory(Long categoryId) {
        Category category = categoryRepository.findById(categoryId)
                .filter(c -> !Boolean.TRUE.equals(c.getDeleted()))
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));

        if (!category.getIsActive()) {
            throw new BadRequestException("Category is inactive");
        }
        return category;
    }
}