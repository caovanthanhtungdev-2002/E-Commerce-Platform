package e_commerce.platform.modules.product.spec;

import e_commerce.platform.modules.product.dto.request.ProductSearchRequest;
import e_commerce.platform.modules.product.entity.Product;
import e_commerce.platform.modules.product.entity.ProductStatus;
import org.springframework.data.jpa.domain.Specification;

import java.util.List;

public class ProductSpecification {

    public static Specification<Product> forUser(ProductSearchRequest req) {
        return (root, query, cb) -> {
            var predicate = cb.conjunction();

            // Luôn filter ACTIVE
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

            //  Ưu tiên categoryIds (list) hơn categoryId (single)
            if (req.getCategoryIds() != null && !req.getCategoryIds().isEmpty()) {
                predicate = cb.and(predicate,
                        root.get("category").get("id").in(req.getCategoryIds()));
            } else if (req.getCategoryId() != null) {
                predicate = cb.and(predicate,
                        cb.equal(root.get("category").get("id"), req.getCategoryId()));
            }

            return predicate;
        };
    }
}