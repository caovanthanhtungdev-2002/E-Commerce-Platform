// e_commerce/platform/modules/product/spec/ProductSpecification.java
package e_commerce.platform.modules.product.spec;

import e_commerce.platform.modules.product.dto.request.ProductSearchRequest;
import e_commerce.platform.modules.product.entity.Product;
import e_commerce.platform.modules.product.entity.ProductStatus;
import org.springframework.data.jpa.domain.Specification;

public class ProductSpecification {

    /** Dùng cho User: chỉ thấy ACTIVE */
    public static Specification<Product> forUser(ProductSearchRequest req) {
        return (root, query, cb) -> {
            var predicate = cb.conjunction();

            // luôn filter ACTIVE
            predicate = cb.and(predicate,
                    cb.equal(root.get("status"), ProductStatus.ACTIVE));

            if (req.getKeyword() != null && !req.getKeyword().isBlank()) {
                predicate = cb.and(predicate,
                        cb.like(cb.lower(root.get("name")),
                                "%" + req.getKeyword().toLowerCase() + "%"));
            }
            if (req.getMinPrice() != null) {
                predicate = cb.and(predicate,
                        cb.greaterThanOrEqualTo(root.get("price"), req.getMinPrice()));
            }
            if (req.getMaxPrice() != null) {
                predicate = cb.and(predicate,
                        cb.lessThanOrEqualTo(root.get("price"), req.getMaxPrice()));
            }

            return predicate;
        };
    }
}