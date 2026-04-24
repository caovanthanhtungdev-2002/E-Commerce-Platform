package e_commerce.platform.admin.service;

import e_commerce.platform.modules.product.dto.request.CreateProductRequest;
import e_commerce.platform.modules.product.dto.request.UpdateProductRequest;
import e_commerce.platform.modules.product.dto.request.ProductSearchRequest;
import e_commerce.platform.modules.product.dto.response.ProductResponse;
import e_commerce.platform.modules.product.entity.Product;

import org.springframework.data.domain.Page;
import java.util.List;

public interface AdminProductService {

    List<Product> getProducts(int page, int size);

    Product getProductById(Long id);

    List<Product> searchProducts(String keyword);

    Page<ProductResponse> searchWithFilter(ProductSearchRequest request, int page, int size);

    List<Product> getProductsByCategory(Long categoryId);

    void createProduct(CreateProductRequest request);

    void updateProduct(Long id, UpdateProductRequest request);

    void approveProduct(Long id);

    void disableProduct(Long id);

    void deleteProduct(Long id);
}