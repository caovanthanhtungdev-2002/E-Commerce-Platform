package e_commerce.platform.modules.product.service.impl;

import e_commerce.platform.cache.redis.RedisKey;
import e_commerce.platform.cache.redis.RedisService;
import e_commerce.platform.exception.ResourceNotFoundException;
import e_commerce.platform.exception.BadRequestException;
import e_commerce.platform.modules.audit.service.AuditService;
import e_commerce.platform.modules.category.entity.Category;
import e_commerce.platform.modules.category.repository.CategoryRepository;
import e_commerce.platform.modules.inventory.service.InventoryService;
import e_commerce.platform.modules.product.dto.request.*;
import e_commerce.platform.modules.product.dto.response.ProductResponse;
import e_commerce.platform.modules.product.entity.Product;
import e_commerce.platform.modules.product.mapper.ProductMapper;
import e_commerce.platform.modules.product.repository.ProductRepository;
import e_commerce.platform.modules.product.service.ProductService;
import e_commerce.platform.modules.product.spec.ProductSpecification;

import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.*;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final RedisService redisService;
    private final AuditService auditService;
    private final InventoryService inventoryService;

    // ================= GET CURRENT USER =================
    private String getCurrentUser() {
        return SecurityContextHolder.getContext().getAuthentication().getName();
    }

    // ================= CREATE =================
    @Override
    public ProductResponse create(CreateProductRequest request) {

        String username = getCurrentUser();

        // validate price
        if (request.getPrice() == null || request.getPrice() <= 0) {
            throw new BadRequestException("Price must be > 0");
        }

        // validate stock
        if (request.getStock() == null || request.getStock() < 0) {
            throw new BadRequestException("Invalid stock");
        }

        Category category = categoryRepository.findById(request.getCategoryId())
                .filter(c -> !Boolean.TRUE.equals(c.getDeleted()))
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));

        if (!category.getIsActive()) {
            throw new BadRequestException("Category is inactive");
        }

        Product product = Product.builder()
                .name(request.getName())
                .description(request.getDescription())
                .price(request.getPrice())
                .imageUrl(request.getImageUrl())
                .active(true)
                .deleted(false)
                .createdAt(LocalDateTime.now())
                .createdBy(username)
                .category(category)
                .build();

        productRepository.save(product);

        // create inventory
        inventoryService.createInventory(product.getId(), request.getStock());

        // clear cache list
        redisService.delete(RedisKey.productList());

        auditService.log(username, "CREATE_PRODUCT", product.getName());

        return ProductMapper.toResponse(product);
    }

    // ================= UPDATE =================
    @Override
    public ProductResponse update(Long id, UpdateProductRequest request) {

        String username = getCurrentUser();

        Product product = productRepository.findById(id)
                .filter(p -> !p.isDeleted())
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        // validate price
        if (request.getPrice() != null && request.getPrice() <= 0) {
            throw new BadRequestException("Price must be > 0");
        }

        if (request.getName() != null) product.setName(request.getName());
        if (request.getDescription() != null) product.setDescription(request.getDescription());
        if (request.getPrice() != null) product.setPrice(request.getPrice());
        if (request.getImageUrl() != null) product.setImageUrl(request.getImageUrl());
        if (request.getActive() != null) product.setActive(request.getActive());

        // update stock qua inventory
        if (request.getStock() != null) {
            inventoryService.increaseStock(id, request.getStock());
        }

        // update category
        if (request.getCategoryId() != null) {
            Category category = categoryRepository.findById(request.getCategoryId())
                    .filter(c -> !Boolean.TRUE.equals(c.getDeleted()))
                    .orElseThrow(() -> new ResourceNotFoundException("Category not found"));

            if (!category.getIsActive()) {
                throw new BadRequestException("Category is inactive");
            }

            product.setCategory(category);
        }

        product.setUpdatedAt(LocalDateTime.now());
        product.setUpdatedBy(username);

        productRepository.save(product);

        // clear cache
        redisService.delete(RedisKey.product(id));
        redisService.delete(RedisKey.productList());

        auditService.log(username, "UPDATE_PRODUCT", product.getName());

        return ProductMapper.toResponse(product);
    }

    // ================= DELETE =================
    @Override
    public void delete(Long id) {

        String username = getCurrentUser();

        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        if (product.isDeleted()) {
            throw new ResourceNotFoundException("Product already deleted");
        }

        product.setDeleted(true);
        productRepository.save(product);

        redisService.delete(RedisKey.product(id));
        redisService.delete(RedisKey.productList());

        auditService.log(username, "DELETE_PRODUCT", product.getName());
    }

    // ================= GET BY ID =================
    @Override
    public ProductResponse getById(Long id) {

        String key = RedisKey.product(id);

        Object cached = redisService.get(key);
        if (cached instanceof ProductResponse response) {
            return response;
        }

        Product product = productRepository.findById(id)
                .filter(p -> !p.isDeleted())
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        ProductResponse response = ProductMapper.toResponse(product);

        redisService.set(key, response, 300);

        return response;
    }

    // ================= GET ALL =================
    @Override
public Page<ProductResponse> getAll(int page, int size) {

    size = Math.min(size, 50);

    String key = RedisKey.productList(page, size);

    Object cached = redisService.get(key);
    if (cached instanceof Page<?> cachedPage) {
        return (Page<ProductResponse>) cachedPage;
    }

    Pageable pageable = PageRequest.of(page, size);

    Page<ProductResponse> result = productRepository
            .findAllByDeletedFalse(pageable)
            .map(ProductMapper::toResponse);

    redisService.set(key, result, 300); // cache 5 phút

    return result;
}
    // ================= SEARCH =================
    @Override
    public Page<ProductResponse> search(ProductSearchRequest request, int page, int size) {

        size = Math.min(size, 50);
        Pageable pageable = PageRequest.of(page, size, Sort.by("id").descending());

        return productRepository
                .findAll(ProductSpecification.filter(request), pageable)
                .map(ProductMapper::toResponse);
    }
}