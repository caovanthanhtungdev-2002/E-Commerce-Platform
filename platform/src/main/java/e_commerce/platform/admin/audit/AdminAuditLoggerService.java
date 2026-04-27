package e_commerce.platform.admin.audit;

public interface AdminAuditLoggerService {

    void log(AdminAuditLog log);

    void log(String admin, AdminAuditAction action, String description);
}