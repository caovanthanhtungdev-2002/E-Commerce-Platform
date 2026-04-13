package e_commerce.platform.modules.product.dto.request;

import lombok.Data;
import jakarta.validation.constraints.*;

@Data
public class CreateProductRequest {
    @NotBlank
    private String name;

    private String description;

    @NotNull
    @Positive
    private Double price;

    private Integer stock;

    private String imageUrl;

    @NotNull
    private Long categoryId;
}