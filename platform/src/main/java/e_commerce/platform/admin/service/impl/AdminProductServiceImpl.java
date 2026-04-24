package e_commerce.platform.admin.service.impl;

import e_commerce.platform.admin.service.AdminProductService;

import e_commerce.platform.modules.product.entity.Product;
import e_commerce.platform.modules.product.repository.ProductRepository;
import e_commerce.platform.modules.product.dto.request.CreateProductRequest;
import e_commerce.platform.modules.product.dto.request.UpdateProductRequest;
import e_commerce.platform.modules.product.dto.request.ProductSearchRequest;
import e_commerce.platform.modules.product.dto.response.ProductResponse;
import e_commerce.platform.modules.product.mapper.ProductMapper;
import e_commerce.platform.modules.product.spec.ProductSpecification;

import e_commerce.platform.modules.category.entity.Category;
import e_commerce.platform.modules.category.repository.CategoryRepository;

import e_commerce.platform.modules.inventory.service.InventoryService;

import e_commerce.platform.exception.ResourceNotFoundException;
import e_commerce.platform.exception.BadRequestException;

import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class AdminProductServiceImpl implements AdminProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final InventoryService inventoryService;

    // ================= GET ALL =================
    @Override
    public List<Product> getProducts(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return productRepository.findAll(pageable).getContent();
    }

    // ================= GET BY ID =================
    @Override
    public Product getProductById(Long id) {
        return productRepository.findById(id)
                .filter(p -> !p.isDeleted())
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));
    }

    // ================= SEARCH =================
    @Override
    public List<Product> searchProducts(String keyword) {
        if (keyword == null || keyword.trim().isEmpty()) {
            throw new BadRequestException("Keyword is required");
        }
        return productRepository.findByNameContainingIgnoreCase(keyword.trim());
    }

    // ================= SEARCH WITH FILTER (nâng cao) =================
    @Override
    public Page<ProductResponse> searchWithFilter(ProductSearchRequest request, int page, int size) {
        size = Math.min(size, 50);
        Pageable pageable = PageRequest.of(page, size, Sort.by("id").descending());
        return productRepository
                .findAll(ProductSpecification.filter(request), pageable)
                .map(ProductMapper::toResponse);
    }

    // ================= FILTER BY CATEGORY =================
    @Override
    public List<Product> getProductsByCategory(Long categoryId) {
        if (!categoryRepository.existsById(categoryId)) {
            throw new ResourceNotFoundException("Category not found with id: " + categoryId);
        }
        return productRepository.findByCategory_Id(categoryId);
    }

    // ================= CREATE =================
    @Override
    public void createProduct(CreateProductRequest request) {
        if (request.getName() == null || request.getName().isBlank()) {
            throw new BadRequestException("Product name is required");
        }

        if (request.getPrice() == null || request.getPrice() <= 0) {
            throw new BadRequestException("Price must be greater than 0");
        }

        if (request.getStock() == null || request.getStock() < 0) {
            throw new BadRequestException("Invalid stock value");
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
                .active(false)        // admin tạo → chờ duyệt
                .deleted(false)
                .createdAt(LocalDateTime.now())
                .createdBy("ADMIN")
                .category(category)
                .build();

        productRepository.save(product);

        // tạo inventory cho product
        inventoryService.createInventory(product.getId(), request.getStock());
    }

    // ================= UPDATE =================
    @Override
    public void updateProduct(Long id, UpdateProductRequest request) {
        Product product = getProductById(id);

        if (request.getPrice() != null && request.getPrice() <= 0) {
            throw new BadRequestException("Price must be greater than 0");
        }

        if (request.getName() != null && !request.getName().isBlank()) {
            product.setName(request.getName());
        }

        if (request.getDescription() != null) {
            product.setDescription(request.getDescription());
        }

        if (request.getPrice() != null) {
            product.setPrice(request.getPrice());
        }

        if (request.getImageUrl() != null) {
            product.setImageUrl(request.getImageUrl());
        }

        if (request.getActive() != null) {
            product.setActive(request.getActive());
        }

        // update stock nếu có
        if (request.getStock() != null) {
            if (request.getStock() < 0) {
                throw new BadRequestException("Invalid stock value");
            }
            inventoryService.increaseStock(product.getId(), request.getStock());
        }

        // update category nếu có
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
        product.setUpdatedBy("ADMIN");
    }

    // ================= APPROVE =================
    @Override
    public void approveProduct(Long id) {
        Product product = getProductById(id);

        if (product.isActive()) {
            throw new BadRequestException("Product is already approved");
        }

        product.setActive(true);
        product.setUpdatedAt(LocalDateTime.now());
        product.setUpdatedBy("ADMIN");
    }

    // ================= DISABLE =================
    @Override
    public void disableProduct(Long id) {
        Product product = getProductById(id);

        if (!product.isActive()) {
            throw new BadRequestException("Product is already disabled");
        }

        product.setActive(false);
        product.setUpdatedAt(LocalDateTime.now());
        product.setUpdatedBy("ADMIN");
    }

    // ================= DELETE (soft delete) =================
    @Override
    public void deleteProduct(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));

        if (product.isDeleted()) {
            throw new BadRequestException("Product is already deleted");
        }

        product.setDeleted(true);
        product.setUpdatedAt(LocalDateTime.now());
        product.setUpdatedBy("ADMIN");
    }
}