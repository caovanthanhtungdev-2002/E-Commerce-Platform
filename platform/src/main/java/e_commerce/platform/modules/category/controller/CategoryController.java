package e_commerce.platform.modules.category.controller;

import e_commerce.platform.common.response.ApiResponse;
import e_commerce.platform.modules.category.dto.request.CreateCategoryRequest;
import e_commerce.platform.modules.category.dto.request.UpdateCategoryRequest;
import e_commerce.platform.modules.category.dto.response.CategoryResponse;
import e_commerce.platform.modules.category.service.CategoryService;

import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;

    @PostMapping
    public ApiResponse<CategoryResponse> create(
            @Valid @RequestBody CreateCategoryRequest request) {

        return new ApiResponse<>(
                true,
                "Created",
                categoryService.create(request)
        );
    }

    @PutMapping("/{id}")
    public ApiResponse<CategoryResponse> update(
            @PathVariable Long id,
            @RequestBody UpdateCategoryRequest request) {

        return new ApiResponse<>(
                true,
                "Updated",
                categoryService.update(id, request)
        );
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable Long id) {

        categoryService.delete(id);

        return new ApiResponse<>(true, "Deleted", null);
    }

    @GetMapping
    public ApiResponse<Page<CategoryResponse>> getAll(
            @RequestParam int page,
            @RequestParam int size) {

        return new ApiResponse<>(
                true,
                "Success",
                categoryService.getAll(page, size)
        );
    }
}