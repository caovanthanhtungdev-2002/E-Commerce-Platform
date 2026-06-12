
package e_commerce.platform.modules.product.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@Builder
@NoArgsConstructor   
@AllArgsConstructor
public class ProductResponse {
    private Long id;
    private String name;
    private String description;
    private Double price;
    private String imageUrl;
    private String categoryName;
    private Double avgRating;
    private Long reviewCount;
    private List<String> images;
}