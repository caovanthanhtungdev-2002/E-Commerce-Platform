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

import java.util.stream.Collectors;

import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepository categoryRepository;
    private final RedisService redisService;

    @Override
    public CategoryResponse create(CreateCategoryRequest request) {

        if (categoryRepository.existsByNameIgnoreCase(request.getName())) {
            throw new ConflictException("Category already exists");
        }

        Category parent = null;
        if (request.getParentId() != null) {
            parent = categoryRepository.findById(request.getParentId())
                .orElseThrow(() -> new ResourceNotFoundException("Parent category not found"));
        }

        Category category = Category.builder()
                .name(request.getName())
                .description(request.getDescription())
                .parent(parent)
                .isActive(true)
                .deleted(false)
                .createdAt(LocalDateTime.now())
                .createdBy("SYSTEM")
                .build();

        categoryRepository.save(category);
        redisService.deletePattern("category:*");

        return CategoryMapper.toResponse(category);
    }

    @Override
    public CategoryResponse update(Long id, UpdateCategoryRequest request) {

        Category category = categoryRepository.findById(id)
                .filter(c -> !Boolean.TRUE.equals(c.getDeleted()))
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));

        if (request.getName() != null &&
                categoryRepository.existsByNameIgnoreCase(request.getName())) {
            throw new ConflictException("Category name already exists");
        }

        if (request.getName() != null) category.setName(request.getName());
        if (request.getDescription() != null) category.setDescription(request.getDescription());
        if (request.getIsActive() != null) category.setIsActive(request.getIsActive());

        category.setUpdatedBy("SYSTEM");
        categoryRepository.save(category);
        redisService.deletePattern("category:*");

        return CategoryMapper.toResponse(category);
    }

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
        redisService.deletePattern("category:*");
    }

    @Override
    public Page<CategoryResponse> getAll(int page, int size) {

        size = Math.min(size, 50);
        String key = "category:list:" + page + ":" + size;

        Object cached = redisService.get(key);
        if (cached instanceof List<?> list) {
            List<CategoryResponse> data = (List<CategoryResponse>) list;
            return new PageImpl<>(data, PageRequest.of(page, size), data.size());
        }

        Pageable pageable = PageRequest.of(page, size);
        Page<CategoryResponse> result = categoryRepository
                .findByDeletedFalseAndIsActiveTrue(pageable)
                .map(CategoryMapper::toResponse);

        redisService.set(key, result.getContent(), 300);
        return result;
    }

    /**
     * Build tree đệ quy N cấp trong memory.
     *
     * Cách hoạt động:
     * 1. Lấy toàn bộ category active bằng 1 query duy nhất
     * 2. Group theo parentId
     * 3. Gắn children cho từng node đệ quy từ root
     *
     * Lợi ích so với LEFT JOIN FETCH:
     * - Tránh N+1 query
     * - Hỗ trợ N cấp (không giới hạn)
     * - Không bị Hibernate "bag fetch" exception
     */
    @Override
    public List<CategoryResponse> getRootWithChildren() {
        // 1. Lấy tất cả category active — 1 query duy nhất
        List<Category> all = categoryRepository.findAllActiveCategories();

        // 2. Group theo parentId: parentId -> list children
        Map<Long, List<Category>> byParent = all.stream()
                .filter(c -> c.getParent() != null)
                .collect(Collectors.groupingBy(c -> c.getParent().getId()));

        // 3. Build tree đệ quy từ root (parent == null)
        List<Category> roots = all.stream()
                .filter(c -> c.getParent() == null)
                .toList();

        return roots.stream()
                .map(root -> buildTree(root, byParent))
                .toList();
    }

    /**
     * Đệ quy gắn children vào CategoryResponse.
     */
    private CategoryResponse buildTree(Category node, Map<Long, List<Category>> byParent) {
        List<CategoryResponse> childResponses = byParent
                .getOrDefault(node.getId(), List.of())
                .stream()
                .map(child -> buildTree(child, byParent))
                .toList();

        return CategoryResponse.builder()
                .id(node.getId())
                .name(node.getName())
                .description(node.getDescription())
                .isActive(node.getIsActive())
                .parentId(node.getParent() != null ? node.getParent().getId() : null)
                .parentName(node.getParent() != null ? node.getParent().getName() : null)
                .children(childResponses)
                .build();
    }

    @Override
    public List<CategoryResponse> getChildren(Long parentId) {
        return categoryRepository.findByParentIdAndDeletedFalseAndIsActiveTrue(parentId)
            .stream()
            .map(CategoryMapper::toResponse)
            .toList();
    }
}