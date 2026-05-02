package e_commerce.platform.modules.category.controller;

import e_commerce.platform.common.response.ApiResponse;
import e_commerce.platform.modules.category.dto.response.CategoryResponse;
import e_commerce.platform.modules.category.service.CategoryService;

import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.*;



@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;

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