// e_commerce/platform/admin/controller/AdminProductController.java
package e_commerce.platform.admin.controller;

import e_commerce.platform.admin.dto.request.AdminCreateProductRequest;
import e_commerce.platform.admin.dto.request.AdminProductFilterRequest;
import e_commerce.platform.admin.dto.request.AdminUpdateProductRequest;
import e_commerce.platform.admin.dto.response.AdminProductResponse;
import e_commerce.platform.admin.service.AdminProductService;
import e_commerce.platform.common.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/products")
@RequiredArgsConstructor
public class AdminProductController {

    private final AdminProductService productService;

    @PostMapping
    public ApiResponse<AdminProductResponse> create(
            @Valid @RequestBody AdminCreateProductRequest request) {
        return ApiResponse.success("Created", productService.create(request));
    }

    @GetMapping
    public ApiResponse<Page<AdminProductResponse>> getAll(
            @ModelAttribute AdminProductFilterRequest filter,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ApiResponse.success("Success", productService.getAll(filter, page, size));
    }

    @GetMapping("/{id}")
    public ApiResponse<AdminProductResponse> getById(@PathVariable Long id) {
        return ApiResponse.success("Success", productService.getById(id));
    }

    @PutMapping("/{id}")
    public ApiResponse<AdminProductResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody AdminUpdateProductRequest request) {
        return ApiResponse.success("Updated", productService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        productService.delete(id);
        return ApiResponse.success("Deleted", null);
    }
}