package e_commerce.platform.admin.audit;

import e_commerce.platform.modules.audit.service.AuditService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AdminAuditLoggerServiceImpl implements AdminAuditLoggerService {

    private final AuditService auditService;

    @Override
    public void log(AdminAuditLog log) {
        auditService.log(
                log.getAdmin(),
                log.getAction().name(),
                buildDescription(log)
        );
    }

    @Override
    public void log(String admin, AdminAuditAction action, String description) {
        auditService.log(
                admin,
                action.name(),
                description
        );
    }

    private String buildDescription(AdminAuditLog log) {
        return String.format(
                "%s | IP: %s | API: %s %s",
                log.getDescription(),
                log.getIpAddress(),
                log.getMethod(),
                log.getEndpoint()
        );
    }
}
