package e_commerce.platform.admin.audit;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class AdminAuditLogger {

    private final AdminAuditLoggerService auditService; 
    private final HttpServletRequest request;

    public void log(AdminAuditAction action, String description) {

        String admin = request.getUserPrincipal() != null
                ? request.getUserPrincipal().getName()
                : "UNKNOWN";

        AdminAuditLog log = AdminAuditLog.builder()
                .admin(admin)
                .action(action)
                .description(description)
                .ipAddress(getClientIp())
                .endpoint(request.getRequestURI())
                .method(request.getMethod())
                .timestamp(java.time.LocalDateTime.now()) // thêm timestamp
                .build();

        auditService.log(log);
    }

    private String getClientIp() {
        String xfHeader = request.getHeader("X-Forwarded-For");
        return (xfHeader == null) ? request.getRemoteAddr() : xfHeader.split(",")[0];
    }
}