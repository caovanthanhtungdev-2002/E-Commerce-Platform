package e_commerce.platform.admin.dto.response;

import e_commerce.platform.modules.auth.enums.Role;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class AdminUserResponse {

    private Long id;

    private String username;

    private String fullName;

    private String email;

    private String phone;

    private Role role;

    private Boolean enabled;

    private LocalDateTime createdAt;
}