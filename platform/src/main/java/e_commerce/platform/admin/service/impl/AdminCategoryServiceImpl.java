package e_commerce.platform.admin.service.impl;

import e_commerce.platform.exception.ResourceNotFoundException;
import e_commerce.platform.exception.ConflictException;
import e_commerce.platform.modules.category.dto.request.CreateCategoryRequest;
import e_commerce.platform.modules.category.dto.request.UpdateCategoryRequest;
import e_commerce.platform.modules.category.dto.response.CategoryResponse;
import e_commerce.platform.modules.category.entity.Category;
import e_commerce.platform.modules.category.mapper.CategoryMapper;
import e_commerce.platform.modules.category.repository.CategoryRepository;
import e_commerce.platform.admin.service.AdminCategoryService;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AdminCategoryServiceImpl implements AdminCategoryService {

    private final CategoryRepository categoryRepository;

    @Override
    public Page<CategoryResponse> getAll(int page, int size) {

        Pageable pageable = PageRequest.of(page, size);

    
        return categoryRepository.findAll(pageable)
                .map(CategoryMapper::toResponse);
    }

    @Override
    public CategoryResponse create(CreateCategoryRequest request) {

        if (categoryRepository.existsByNameIgnoreCase(request.getName())) {
            throw new ConflictException("Category already exists");
        }

        Category category = Category.builder()
                .name(request.getName())
                .description(request.getDescription())
                .isActive(true)
                .deleted(false)
                .createdAt(LocalDateTime.now())
                .createdBy("ADMIN")
                .build();

        categoryRepository.save(category);

        return CategoryMapper.toResponse(category);
    }

    @Override
    public CategoryResponse update(Long id, UpdateCategoryRequest request) {

        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));

 
        if (request.getName() != null) category.setName(request.getName());
        if (request.getDescription() != null) category.setDescription(request.getDescription());
        if (request.getIsActive() != null) category.setIsActive(request.getIsActive());

        categoryRepository.save(category);

        return CategoryMapper.toResponse(category);
    }

    @Override
    public void delete(Long id) {

        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));

       
        categoryRepository.delete(category);

    }
}