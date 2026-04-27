package e_commerce.platform.admin.dto.request;

import e_commerce.platform.modules.auth.enums.Role;
import jakarta.validation.constraints.NotNull;

import lombok.Data;

@Data
public class AdminUpdateUserRoleRequest {

    @NotNull(message = "Role is required")
    private Role role;
}