package e_commerce.platform.modules.category.service.impl;

import e_commerce.platform.cache.redis.RedisKey;
import e_commerce.platform.cache.redis.RedisService;
import e_commerce.platform.exception.ConflictException;
import e_commerce.platform.exception.ResourceNotFoundException;
import e_commerce.platform.modules.category.dto.request.CreateCategoryRequest;
import e_commerce.platform.modules.category.dto.request.UpdateCategoryRequest;
import e_commerce.platform.modules.category.dto.response.CategoryResponse;
import e_commerce.platform.modules.category.entity.Category;
import e_commerce.platform.modules.category.mapper.CategoryMapper;
import e_commerce.platform.modules.category.repository.CategoryRepository;
import e_commerce.platform.modules.category.service.CategoryService;


import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;


@Service
@RequiredArgsConstructor
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepository categoryRepository;
    private final RedisService redisService;

    // ================= CREATE =================
    @Override
    public CategoryResponse create(CreateCategoryRequest request) {

        if (categoryRepository.existsByNameIgnoreCase(request.getName())) {
            throw new ConflictException("Category already exists");
        }
        
         String username = "SYSTEM"; // tạm, sau sẽ lấy từ JWT
        Category category = Category.builder()
        .name(request.getName())
        .description(request.getDescription())
        .isActive(true)
        .deleted(false)
        .createdAt(LocalDateTime.now())
        .createdBy(username)
        .build();

        categoryRepository.save(category);

        // clear cache
        redisService.delete(RedisKey.categoryList());

        return CategoryMapper.toResponse(category);
    }

    // ================= UPDATE =================
    @Override
    public CategoryResponse update(Long id, UpdateCategoryRequest request) {

       Category category = categoryRepository.findById(id)
        .filter(c -> !Boolean.TRUE.equals(c.getDeleted()))
        .orElseThrow(() -> new ResourceNotFoundException("Category not found"));

       if (request.getName() != null &&
    categoryRepository.existsByNameIgnoreCase(request.getName())) {
    throw new ConflictException("Category name already exists");
}

        if (request.getDescription() != null) {
            category.setDescription(request.getDescription());
        }

        if (request.getIsActive() != null) {
            category.setIsActive(request.getIsActive());
        }

        category.setUpdatedBy("SYSTEM");
        categoryRepository.save(category);

        // clear cache
        redisService.delete(RedisKey.categoryList());

        return CategoryMapper.toResponse(category);
    }

    // ================= DELETE (soft delete) =================
    @Override
    public void delete(Long id) {

        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));

        if (Boolean.TRUE.equals(category.getDeleted())) {
    throw new ResourceNotFoundException("Category already deleted");
}

        category.setDeleted(true);
        category.setIsActive(false);
        categoryRepository.save(category);

        redisService.delete(RedisKey.categoryList());
    }

    // ================= GET ALL =================
    @Override
public Page<CategoryResponse> getAll(int page, int size) {

    size = Math.min(size, 50); // max 50
    
    String key = RedisKey.categoryList();

    // 1. CHECK CACHE
    Object cached = redisService.get(key);
    if (cached instanceof Page<?> cachedPage) {
        return (Page<CategoryResponse>) cachedPage;
    }

    // 2. QUERY DB
    
    Pageable pageable = PageRequest.of(page, size);

    Page<CategoryResponse> result = categoryRepository
            .findByDeletedFalseAndIsActiveTrue(pageable)
            .map(CategoryMapper::toResponse);

    // 3. SAVE CACHE (TTL 5 phút)
    redisService.set(key, result, 300);

    return result;
}

}