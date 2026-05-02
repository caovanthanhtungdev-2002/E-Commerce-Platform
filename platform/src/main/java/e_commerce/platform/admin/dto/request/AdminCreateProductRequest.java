package e_commerce.platform.admin.dto.request;


import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class AdminCreateProductRequest {

    @NotBlank
    private String name;

    private String description;

    @NotNull
    @Positive
    private Double price;

    @NotNull
    @Min(0)
    private Integer stock;

    private String imageUrl;

    @NotNull
    private Long categoryId;
}
