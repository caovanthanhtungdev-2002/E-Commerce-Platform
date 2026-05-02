// e_commerce/platform/modules/product/service/ProductService.java
package e_commerce.platform.modules.product.service;

import e_commerce.platform.modules.product.dto.request.ProductSearchRequest;
import e_commerce.platform.modules.product.dto.response.ProductResponse;
import org.springframework.data.domain.Page;

public interface ProductService {

    /** Public: xem chi tiết 1 product (chỉ ACTIVE) */
    ProductResponse getById(Long id);

    /** Public: danh sách ACTIVE products */
    Page<ProductResponse> getAll(int page, int size);

    /** Public: tìm kiếm ACTIVE products */
    Page<ProductResponse> search(ProductSearchRequest request, int page, int size);

    /** Internal: cập nhật rating sau review (gọi từ Kafka) */
    void updateRating(Long productId);
}