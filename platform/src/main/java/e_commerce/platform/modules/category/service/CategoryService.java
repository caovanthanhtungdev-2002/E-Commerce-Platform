package e_commerce.platform.modules.category.service;

import e_commerce.platform.modules.category.dto.request.CreateCategoryRequest;
import e_commerce.platform.modules.category.dto.request.UpdateCategoryRequest;
import e_commerce.platform.modules.category.dto.response.CategoryResponse;

import org.springframework.data.domain.Page;

public interface CategoryService {

    CategoryResponse create(CreateCategoryRequest request);

    CategoryResponse update(Long id, UpdateCategoryRequest request);

    void delete(Long id);

    Page<CategoryResponse> getAll(int page, int size);
}