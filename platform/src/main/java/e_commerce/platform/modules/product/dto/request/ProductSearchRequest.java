
package e_commerce.platform.modules.product.dto.request;
import java.util.List;
import lombok.Data;

@Data
public class ProductSearchRequest {
    private String keyword;
    private Double minPrice;
    private Double maxPrice;
    private Long categoryId;
     private List<Long> categoryIds;
   
}