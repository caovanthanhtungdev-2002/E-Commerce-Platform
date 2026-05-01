package e_commerce.platform.admin.controller;

import e_commerce.platform.admin.service.AdminCategoryService;
import e_commerce.platform.common.response.ApiResponse;
import e_commerce.platform.modules.category.dto.request.CreateCategoryRequest;
import e_commerce.platform.modules.category.dto.request.UpdateCategoryRequest;
import e_commerce.platform.modules.category.dto.response.CategoryResponse;


import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.Page;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;


@RestController
@RequestMapping("/api/admin/categories")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminCategoryController {
    private final AdminCategoryService adminCategoryService;

    @PostMapping
public ApiResponse<CategoryResponse> create(
        @Valid @RequestBody CreateCategoryRequest request) {

    return new ApiResponse<>(
            true,
            "Created",
            adminCategoryService.create(request)
    );
}

    @PutMapping("/{id}")
    public ApiResponse<CategoryResponse> update(
            @PathVariable Long id,
            @Valid@RequestBody UpdateCategoryRequest request) {

        return new ApiResponse<>(
                true,
                "Updated",
                adminCategoryService.update(id, request)
        );
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable Long id) {

        adminCategoryService.delete(id);

        return new ApiResponse<>(true, "Deleted", null);
    }

    @GetMapping
    public ApiResponse<Page<CategoryResponse>> getAll(
            @RequestParam int page,
            @RequestParam int size) {

        return new ApiResponse<>(
                true,
                "Success",
                adminCategoryService.getAll(page, size)
        );
    }
}
