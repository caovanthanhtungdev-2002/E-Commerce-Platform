// e_commerce/platform/admin/service/AdminProductService.java
package e_commerce.platform.admin.service;

import e_commerce.platform.admin.dto.request.AdminCreateProductRequest;
import e_commerce.platform.admin.dto.request.AdminProductFilterRequest;
import e_commerce.platform.admin.dto.request.AdminUpdateProductRequest;
import e_commerce.platform.admin.dto.response.AdminProductResponse;
import org.springframework.data.domain.Page;

public interface AdminProductService {

    AdminProductResponse create(AdminCreateProductRequest request);

    Page<AdminProductResponse> getAll(AdminProductFilterRequest filter, int page, int size);

    AdminProductResponse getById(Long id);

    AdminProductResponse update(Long id, AdminUpdateProductRequest request);

    void delete(Long id);
}