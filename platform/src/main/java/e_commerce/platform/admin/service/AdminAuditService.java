package e_commerce.platform.admin.service;

import e_commerce.platform.modules.audit.entity.AuditLog;

import java.time.LocalDateTime;
import java.util.List;

public interface AdminAuditService {

    void log(String admin, String action, String detail);

    List<AuditLog> getLogs(int page, int size);

    List<AuditLog> getLogsByAdmin(String admin);

    List<AuditLog> getLogsByAction(String action);

    List<AuditLog> filterLogs(LocalDateTime from, LocalDateTime to);
}