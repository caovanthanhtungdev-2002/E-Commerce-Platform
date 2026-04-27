package e_commerce.platform.admin.controller;

import e_commerce.platform.admin.service.AdminProductService;
import e_commerce.platform.modules.product.entity.Product;
import lombok.RequiredArgsConstructor;
import e_commerce.platform.modules.product.dto.request.CreateProductRequest;
import e_commerce.platform.admin.dto.request.AdminUpdateProductRequest;

import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/products")
@RequiredArgsConstructor
public class AdminProductController {

    private final AdminProductService productService;

    @GetMapping
    public List<Product> getAll(int page, int size) {
        return productService.getProducts(page, size);
    }

    @PostMapping
    public void create(@RequestBody CreateProductRequest request) {
        productService.createProduct(request);
    }

    @PutMapping("/{id}")
    public void update(@PathVariable Long id,
                       @RequestBody AdminUpdateProductRequest request) {
        productService.updateProduct(id, request);
    }

    @PatchMapping("/{id}/approve")
    public void approve(@PathVariable Long id) {
        productService.approveProduct(id);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        productService.deleteProduct(id);
    }
}