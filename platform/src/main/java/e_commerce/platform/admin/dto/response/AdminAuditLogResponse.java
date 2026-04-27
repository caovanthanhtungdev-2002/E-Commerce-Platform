package e_commerce.platform.admin.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class AdminAuditLogResponse {

    private Long id;
    private String username;
    private String action;
    private String description;
    private LocalDateTime createdAt;
}
