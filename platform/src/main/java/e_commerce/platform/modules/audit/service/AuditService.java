package e_commerce.platform.modules.audit.service;

public interface AuditService {
    void log(String username, String action, String description);
}