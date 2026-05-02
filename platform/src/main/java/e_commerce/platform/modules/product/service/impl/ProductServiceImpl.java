// e_commerce/platform/modules/product/service/impl/ProductServiceImpl.java
package e_commerce.platform.modules.product.service.impl;

import e_commerce.platform.cache.redis.RedisKey;
import e_commerce.platform.cache.redis.RedisService;
import e_commerce.platform.exception.ResourceNotFoundException;
import e_commerce.platform.modules.product.dto.request.ProductSearchRequest;
import e_commerce.platform.modules.product.dto.response.ProductResponse;
import e_commerce.platform.modules.product.entity.Product;
import e_commerce.platform.modules.product.entity.ProductStatus;
import e_commerce.platform.modules.product.mapper.ProductMapper;
import e_commerce.platform.modules.product.repository.ProductRepository;
import e_commerce.platform.modules.product.service.ProductService;
import e_commerce.platform.modules.product.spec.ProductSpecification;
import e_commerce.platform.modules.review.repository.ReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final RedisService redisService;
    private final ReviewRepository reviewRepository;

    // ── GET BY ID (chỉ ACTIVE) ───────────────────────────────────
    @Override
    public ProductResponse getById(Long id) {
        String key = RedisKey.product(id);

        Object cached = redisService.get(key);
        if (cached instanceof ProductResponse response) return response;

        Product product = productRepository.findById(id)
                .filter(p -> p.getStatus() == ProductStatus.ACTIVE)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        ProductResponse response = ProductMapper.toResponse(product);
        redisService.set(key, response, 300);
        return response;
    }

    // ── GET ALL (chỉ ACTIVE) ─────────────────────────────────────
    @Override
public Page<ProductResponse> getAll(int page, int size) {
    size = Math.min(size, 50);

    Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());

    return productRepository
            .findAllByStatus(ProductStatus.ACTIVE, pageable)
            .map(ProductMapper::toResponse);
}

    // ── SEARCH (chỉ ACTIVE) ──────────────────────────────────────
    @Override
    public Page<ProductResponse> search(ProductSearchRequest request, int page, int size) {
        size = Math.min(size, 50);
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());

        return productRepository
                .findAll(ProductSpecification.forUser(request), pageable)
                .map(ProductMapper::toResponse);
    }

    // ── UPDATE RATING (gọi từ Kafka consumer) ────────────────────
    @Override
    @Transactional
    public void updateRating(Long productId) {
        Double avg = reviewRepository.getAverageRating(productId);
        long total = reviewRepository.countByProductId(productId);

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        product.setAvgRating(avg != null ? avg : 0.0);
        product.setReviewCount(total);
        productRepository.save(product);

        // invalidate cache để user thấy rating mới
        redisService.delete(RedisKey.product(productId));
    }
}
