package e_commerce.platform.modules.product.controller;

import e_commerce.platform.common.response.ApiResponse;
import e_commerce.platform.modules.product.dto.request.CreateProductRequest;
import e_commerce.platform.modules.product.dto.request.ProductSearchRequest;
import e_commerce.platform.modules.product.dto.request.UpdateProductRequest;
import e_commerce.platform.modules.product.dto.response.ProductResponse;
import e_commerce.platform.modules.product.service.ProductService;

import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    @PostMapping
    public ApiResponse<ProductResponse> create(@RequestBody CreateProductRequest request) {
        return new ApiResponse<>(true, "Created", productService.create(request));
    }

    @PostMapping("/search")
    public ApiResponse<Page<ProductResponse>> search(
            @RequestBody ProductSearchRequest request,
            @RequestParam int page,
            @RequestParam int size
    ) {
        return new ApiResponse<>(true, "Success",
                productService.search(request, page, size));
    }
    @PutMapping("/{id}")
    public ApiResponse<ProductResponse> update(
            @PathVariable Long id,
            @RequestBody UpdateProductRequest request
    ) {
        return new ApiResponse<>(true, "Updated", productService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        productService.delete(id);
        return new ApiResponse<>(true, "Deleted", null);
    }

    @GetMapping("/{id}")
    public ApiResponse<ProductResponse> getById(@PathVariable Long id) {
        return new ApiResponse<>(true, "Success", productService.getById(id));
    }

    @GetMapping
    public ApiResponse<Page<ProductResponse>> getAll(
            @RequestParam int page,
            @RequestParam int size
    ) {
        return new ApiResponse<>(true, "Success", productService.getAll(page, size));
    }
}