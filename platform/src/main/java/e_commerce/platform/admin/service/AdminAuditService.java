package e_commerce.platform.admin.service;

import e_commerce.platform.admin.dto.response.AdminAuditLogResponse;

import java.time.LocalDateTime;
import java.util.List;

public interface AdminAuditService {

    List<AdminAuditLogResponse> getLogs(int page, int size);

    List<AdminAuditLogResponse> getByUsername(String username);

    List<AdminAuditLogResponse> getByAction(String action);

    List<AdminAuditLogResponse> filter(LocalDateTime from, LocalDateTime to);
}