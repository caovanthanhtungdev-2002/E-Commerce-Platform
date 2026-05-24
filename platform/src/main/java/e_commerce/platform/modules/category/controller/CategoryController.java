package e_commerce.platform.modules.category.controller;

import e_commerce.platform.common.response.ApiResponse;
import e_commerce.platform.modules.category.dto.response.CategoryResponse;
import e_commerce.platform.modules.category.service.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;

    @GetMapping
    public ApiResponse<Page<CategoryResponse>> getAll(
            @RequestParam int page,
            @RequestParam int size) {
        return new ApiResponse<>(true, "Success", categoryService.getAll(page, size));
    }

    // Lấy tất cả danh mục gốc kèm children — dùng cho menu/sidebar
    @GetMapping("/tree")
    public ApiResponse<List<CategoryResponse>> getTree() {
        return new ApiResponse<>(true, "Success", categoryService.getRootWithChildren());
    }

    // Lấy children của 1 danh mục
    @GetMapping("/{id}/children")
    public ApiResponse<List<CategoryResponse>> getChildren(@PathVariable Long id) {
        return new ApiResponse<>(true, "Success", categoryService.getChildren(id));
    }
}