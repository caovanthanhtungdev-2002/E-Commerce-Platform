package e_commerce.platform.modules.product.service.impl;

import e_commerce.platform.cache.redis.RedisKey;
import e_commerce.platform.cache.redis.RedisService;
import e_commerce.platform.exception.ResourceNotFoundException;
import e_commerce.platform.modules.audit.service.AuditService;
import e_commerce.platform.modules.product.dto.request.*;
import e_commerce.platform.modules.product.dto.response.ProductResponse;
import e_commerce.platform.modules.product.entity.Product;
import e_commerce.platform.modules.product.mapper.ProductMapper;
import e_commerce.platform.modules.product.repository.ProductRepository;
import e_commerce.platform.modules.product.service.ProductService;
import e_commerce.platform.modules.product.spec.ProductSpecification;

import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final RedisService redisService;
    private final AuditService auditService;

    @Override
    public ProductResponse create(CreateProductRequest request) {

        Product product = Product.builder()
                .name(request.getName())
                .description(request.getDescription())
                .price(request.getPrice())
                .stock(request.getStock())
                .imageUrl(request.getImageUrl())
                .active(true)
                .deleted(false)
                .createdAt(LocalDateTime.now())
                .createdBy("SYSTEM")
                .build();

        productRepository.save(product);

        product.setCreatedBy("SYSTEM"); // sau này lấy từ JWT
        
        auditService.log("SYSTEM", "CREATE_PRODUCT", product.getName());

        return ProductMapper.toResponse(product);
    }

    @Override
    public ProductResponse update(Long id, UpdateProductRequest request) {

        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        if (request.getName() != null) product.setName(request.getName());
        if (request.getPrice() != null) product.setPrice(request.getPrice());

        product.setUpdatedAt(LocalDateTime.now());
        product.setUpdatedBy("SYSTEM");

        productRepository.save(product);

        redisService.delete(RedisKey.product(id));

        auditService.log("SYSTEM", "UPDATE_PRODUCT", product.getName());

        return ProductMapper.toResponse(product);
    }

    @Override
    public void delete(Long id) {

        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        product.setDeleted(true);
        productRepository.save(product);

        redisService.delete(RedisKey.product(id));

        auditService.log("SYSTEM", "DELETE_PRODUCT", product.getName());
    }

    @Override
    public ProductResponse getById(Long id) {

        String key = RedisKey.product(id);

        Object cached = redisService.get(key);
        if (cached != null) {
            return (ProductResponse) cached;
        }

        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        ProductResponse response = ProductMapper.toResponse(product);

        redisService.set(key, response, 300);

        return response;
    }

    @Override
    public Page<ProductResponse> getAll(int page, int size) {

        Pageable pageable = PageRequest.of(page, size);

        return productRepository.findAll(pageable)
                .map(ProductMapper::toResponse);
    }

    @Override
    public Page<ProductResponse> search(ProductSearchRequest request, int page, int size) {

        Pageable pageable = PageRequest.of(page, size,Sort.by("id").descending());

        return productRepository
                .findAll(ProductSpecification.filter(request), pageable)
                .map(ProductMapper::toResponse);
    }
}