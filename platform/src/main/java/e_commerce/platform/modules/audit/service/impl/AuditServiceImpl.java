package e_commerce.platform.modules.audit.service.impl;

import e_commerce.platform.modules.audit.entity.AuditLog;
import e_commerce.platform.modules.audit.repository.AuditLogRepository;
import e_commerce.platform.modules.audit.service.AuditService;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AuditServiceImpl implements AuditService {

    private final AuditLogRepository auditLogRepository;

    @Override
    public void log(String username, String action, String description) {

        AuditLog log = AuditLog.builder()
                .username(username)
                .action(action)
                .description(description)
                .createdAt(LocalDateTime.now())
                .build();

        auditLogRepository.save(log);
    }
}