package e_commerce.platform.modules.category.service;

import e_commerce.platform.modules.category.dto.request.CreateCategoryRequest;
import e_commerce.platform.modules.category.dto.request.UpdateCategoryRequest;
import e_commerce.platform.modules.category.dto.response.CategoryResponse;
import org.springframework.data.domain.Page;

import java.util.List;

public interface CategoryService {

    CategoryResponse create(CreateCategoryRequest request);

    CategoryResponse update(Long id, UpdateCategoryRequest request);

    void delete(Long id);

    Page<CategoryResponse> getAll(int page, int size);

    List<CategoryResponse> getRootWithChildren();

    List<CategoryResponse> getChildren(Long parentId);
}