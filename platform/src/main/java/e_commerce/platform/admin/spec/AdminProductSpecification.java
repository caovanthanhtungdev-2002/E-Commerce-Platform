package e_commerce.platform.admin.spec;

import e_commerce.platform.admin.dto.request.AdminProductFilterRequest;
import e_commerce.platform.modules.product.entity.Product;
import org.springframework.data.jpa.domain.Specification;

public class AdminProductSpecification {

    /** Admin thấy tất cả status, filter tùy ý */
    public static Specification<Product> filter(AdminProductFilterRequest req) {
        return (root, query, cb) -> {
            var predicate = cb.conjunction();

            if (req.getKeyword() != null && !req.getKeyword().isBlank()) {
                predicate = cb.and(predicate,
                        cb.like(cb.lower(root.get("name")),
                                "%" + req.getKeyword().toLowerCase() + "%"));
            }
            if (req.getStatus() != null) {
                predicate = cb.and(predicate,
                        cb.equal(root.get("status"), req.getStatus()));
            }
            if (req.getCategoryId() != null) {
                predicate = cb.and(predicate,
                        cb.equal(root.get("category").get("id"), req.getCategoryId()));
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