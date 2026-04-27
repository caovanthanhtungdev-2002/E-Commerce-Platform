package e_commerce.platform.admin.dto.request;

import jakarta.validation.constraints.DecimalMin;
import lombok.Data;

@Data
public class AdminUpdateProductRequest {

    private String name;

    private String description;

    @DecimalMin(value = "0.0", inclusive = false, message = "Price must be greater than 0")
    private Double price;

    private String imageUrl;

    private Boolean active; // admin mới được set

    private Long categoryId; // admin mới được đổi category
}    