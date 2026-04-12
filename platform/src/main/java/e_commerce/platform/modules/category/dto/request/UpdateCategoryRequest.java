package e_commerce.platform.modules.category.dto.request;

import lombok.Data;

@Data
public class UpdateCategoryRequest {

    private String name;
    private String description;
    private Boolean isActive;
}