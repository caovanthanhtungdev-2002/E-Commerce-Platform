package e_commerce.platform.modules.product.spec;

import e_commerce.platform.modules.product.entity.Product;
import e_commerce.platform.modules.product.dto.request.ProductSearchRequest;
import org.springframework.data.jpa.domain.Specification;

public class ProductSpecification {

    public static Specification<Product> filter(ProductSearchRequest req) {

        return (root, query, cb) -> {

            var predicate = cb.conjunction();

            // keyword
            if (req.getKeyword() != null && !req.getKeyword().isBlank()) {
                predicate = cb.and(predicate,
                        cb.like(cb.lower(root.get("name")),
                                "%" + req.getKeyword().toLowerCase() + "%"));
            }

            // min price
            if (req.getMinPrice() != null) {
                predicate = cb.and(predicate,
                        cb.greaterThanOrEqualTo(root.get("price"), req.getMinPrice()));
            }

            // max price
            if (req.getMaxPrice() != null) {
                predicate = cb.and(predicate,
                        cb.lessThanOrEqualTo(root.get("price"), req.getMaxPrice()));
            }

            // active filter (nếu user truyền)
            if (req.getActive() != null) {
                predicate = cb.and(predicate,
                        cb.equal(root.get("active"), req.getActive()));
            } else {
                // mặc định chỉ lấy active = true
                predicate = cb.and(predicate,
                        cb.equal(root.get("active"), true));
            }

            // luôn filter deleted
            predicate = cb.and(predicate,
                    cb.equal(root.get("deleted"), false));

            return predicate;
        };
    }
}