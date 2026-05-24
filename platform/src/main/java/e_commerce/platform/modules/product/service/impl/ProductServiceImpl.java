package e_commerce.platform.modules.product.service.impl;

import e_commerce.platform.cache.redis.RedisKey;
import e_commerce.platform.cache.redis.RedisService;
import e_commerce.platform.exception.ResourceNotFoundException;
import e_commerce.platform.modules.category.repository.CategoryRepository;
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

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final RedisService redisService;
    private final ReviewRepository reviewRepository;
    private final CategoryRepository categoryRepository; 

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

    @Override
    public Page<ProductResponse> getAll(int page, int size) {
        size = Math.min(size, 50);
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());

        return productRepository
                .findAllByStatus(ProductStatus.ACTIVE, pageable)
                .map(ProductMapper::toResponse);
    }

    @Override
    public Page<ProductResponse> search(ProductSearchRequest request, int page, int size) {
        size = Math.min(size, 50);
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());

        // Expand categoryId thành toàn bộ id con cháu
        if (request.getCategoryId() != null) {
            List<Long> allIds = getAllCategoryIds(request.getCategoryId());
            request.setCategoryIds(allIds);
        }

        return productRepository
                .findAll(ProductSpecification.forUser(request), pageable)
                .map(ProductMapper::toResponse);
    }

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

        redisService.delete(RedisKey.product(productId));
    }

    /**
     * Đệ quy lấy id của category đó + toàn bộ con cháu
     *
     * Ví dụ: "Laptop" (id=5)
     *   → children: [Gaming(28), VanPhong(29), AI(30), ...]
     *   → Gaming(28) → children: [ASUS(43), Dell(41), ...]
     *   → Kết quả: [5, 28, 29, 30, 41, 42, 43, 44, 45, 46, ...]
     */
    private List<Long> getAllCategoryIds(Long parentId) {
        List<Long> result = new ArrayList<>();
        result.add(parentId); // thêm chính nó

        List<Long> children = categoryRepository.findChildIdsByParentId(parentId);
        for (Long childId : children) {
            result.addAll(getAllCategoryIds(childId)); // đệ quy
        }

        return result;
    }
}