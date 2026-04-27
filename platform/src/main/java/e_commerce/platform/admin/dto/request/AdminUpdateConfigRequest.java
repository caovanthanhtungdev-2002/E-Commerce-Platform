package e_commerce.platform.admin.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class AdminUpdateConfigRequest {

    @NotBlank
    private String key;

    @NotBlank
    private String value;
}