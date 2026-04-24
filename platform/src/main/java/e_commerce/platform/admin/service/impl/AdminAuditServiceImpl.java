package e_commerce.platform.admin.service.impl;

import e_commerce.platform.admin.service.AdminAuditService;
import e_commerce.platform.modules.audit.entity.AuditLog;
import e_commerce.platform.modules.audit.repository.AuditLogRepository;
import e_commerce.platform.exception.BadRequestException;

import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class AdminAuditServiceImpl implements AdminAuditService {

    private final AuditLogRepository auditLogRepository;

    // ================= LOG =================
    @Override
    public void log(String admin, String action, String detail) {

        if (admin == null || admin.isBlank()) {
            throw new BadRequestException("Admin is required");
        }

        if (action == null || action.isBlank()) {
            throw new BadRequestException("Action is required");
        }

        AuditLog log = AuditLog.builder()
                .username(admin)         
                .action(action)
                .description(detail)      
                .createdAt(LocalDateTime.now())
                .build();

        auditLogRepository.save(log);
    }

    // ================= GET ALL =================
    @Override
    public List<AuditLog> getLogs(int page, int size) {

        if (page < 0 || size <= 0) {
            throw new BadRequestException("Invalid pagination parameters");
        }

        Pageable pageable = PageRequest.of(page, size);

        return auditLogRepository.findAll(pageable).getContent();
    }

    // ================= BY ADMIN =================
    @Override
    public List<AuditLog> getLogsByAdmin(String admin) {

        if (admin == null || admin.isBlank()) {
            throw new BadRequestException("Admin is required");
        }

        // FIX: phải là username
        return auditLogRepository.findByUsername(admin);
    }

    // ================= BY ACTION =================
    @Override
    public List<AuditLog> getLogsByAction(String action) {

        if (action == null || action.isBlank()) {
            throw new BadRequestException("Action is required");
        }

        return auditLogRepository.findByAction(action);
    }

    // ================= FILTER =================
    @Override
    public List<AuditLog> filterLogs(LocalDateTime from, LocalDateTime to) {

        if (from != null && to != null && from.isAfter(to)) {
            throw new BadRequestException("Invalid time range");
        }

        LocalDateTime start = (from != null) ? from : LocalDateTime.MIN;
        LocalDateTime end = (to != null) ? to : LocalDateTime.now();

        return auditLogRepository.findByCreatedAtBetween(start, end);
    }
}