package e_commerce.platform.modules.product.service;

import org.springframework.data.domain.Page;
import e_commerce.platform.modules.product.dto.request.CreateProductRequest;
import e_commerce.platform.modules.product.dto.request.ProductSearchRequest;
import e_commerce.platform.modules.product.dto.request.UpdateProductRequest;
import e_commerce.platform.modules.product.dto.response.ProductResponse;

public interface ProductService {

    ProductResponse create(CreateProductRequest request);

    ProductResponse update(Long id, UpdateProductRequest request);

    void delete(Long id);

    ProductResponse getById(Long id);

    Page<ProductResponse> getAll(int page, int size);
    
    void updateRating(Long productId);
    
    Page<ProductResponse> search(ProductSearchRequest request, int page, int size);
}