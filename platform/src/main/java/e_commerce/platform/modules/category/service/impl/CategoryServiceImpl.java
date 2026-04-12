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

        if (categoryRepository.existsByName(request.getName())) {
            throw new ConflictException("Category already exists");
        }

        Category category = Category.builder()
                .name(request.getName())
                .description(request.getDescription())
                .isActive(true)
                .createdAt(LocalDateTime.now())
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
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));

        if (request.getName() != null) {
            category.setName(request.getName());
        }

        if (request.getDescription() != null) {
            category.setDescription(request.getDescription());
        }

        if (request.getIsActive() != null) {
            category.setIsActive(request.getIsActive());
        }

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

        if (!category.getIsActive()) {
            throw new ResourceNotFoundException("Category already deleted");
        }

        category.setIsActive(false);
        categoryRepository.save(category);

        redisService.delete(RedisKey.categoryList());
    }

    // ================= GET ALL =================
    @Override
    public Page<CategoryResponse> getAll(int page, int size) {

        Pageable pageable = PageRequest.of(page, size);

        return categoryRepository.findAll(pageable)
                .map(CategoryMapper::toResponse);
    }
}