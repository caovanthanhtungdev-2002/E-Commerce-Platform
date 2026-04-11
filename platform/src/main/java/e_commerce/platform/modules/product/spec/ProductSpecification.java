package e_commerce.platform.modules.product.spec;

import e_commerce.platform.modules.product.entity.Product;
import e_commerce.platform.modules.product.dto.request.ProductSearchRequest;
import org.springframework.data.jpa.domain.Specification;

public class ProductSpecification {

    public static Specification<Product> filter(ProductSearchRequest req) {

        return (root, query, cb) -> {

            var predicate = cb.conjunction();

            if (req.getKeyword() != null) {
                predicate = cb.and(predicate,
                        cb.like(root.get("name"), "%" + req.getKeyword() + "%"));
            }

            if (req.getMinPrice() != null) {
                predicate = cb.and(predicate,
                        cb.greaterThanOrEqualTo(root.get("price"), req.getMinPrice()));
            }

            if (req.getMaxPrice() != null) {
                predicate = cb.and(predicate,
                        cb.lessThanOrEqualTo(root.get("price"), req.getMaxPrice()));
            }

            if (req.getActive() != null) {
                predicate = cb.and(predicate,
                        cb.equal(root.get("active"), req.getActive()));
            }

            predicate = cb.and(predicate,
                    cb.equal(root.get("deleted"), false));

            return predicate;
        };
    }
}