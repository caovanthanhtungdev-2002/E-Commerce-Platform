package e_commerce.platform.modules.user.dto.response;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class UserResponse {
    private String username;
    private String email;
    private String fullName;
    private String phone;
   
    private String bio;
    private String avatar;
    private String role;
    private LocalDateTime lastLoginAt;
}
