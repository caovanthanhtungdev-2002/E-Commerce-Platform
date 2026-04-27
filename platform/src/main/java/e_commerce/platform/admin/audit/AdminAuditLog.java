package e_commerce.platform.admin.audit;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class AdminAuditLog {

    private String admin;

    private AdminAuditAction action;

    private String description;

    private String ipAddress;

    private String endpoint;

    private String method;

    private LocalDateTime timestamp;
}