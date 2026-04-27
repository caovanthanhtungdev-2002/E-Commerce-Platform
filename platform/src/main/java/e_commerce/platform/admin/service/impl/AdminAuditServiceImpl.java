package e_commerce.platform.admin.service.impl;

import e_commerce.platform.admin.dto.response.AdminAuditLogResponse;
import e_commerce.platform.admin.service.AdminAuditService;

import e_commerce.platform.modules.audit.entity.AuditLog;
import e_commerce.platform.modules.audit.repository.AuditLogRepository;

import e_commerce.platform.exception.BadRequestException;

import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminAuditServiceImpl implements AdminAuditService {

    private final AuditLogRepository auditLogRepository;

    // ================= GET ALL (phân trang) =================
    @Override
    public List<AdminAuditLogResponse> getLogs(int page, int size) {
        Pageable pageable = PageRequest.of(
                page, size,
                Sort.by("createdAt").descending()
        );
        return auditLogRepository.findAll(pageable)
                .getContent()
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    // ================= GET BY USERNAME =================
    @Override
    public List<AdminAuditLogResponse> getByUsername(String username) {
        if (username == null || username.trim().isEmpty()) {
            throw new BadRequestException("Username is required");
        }
        return auditLogRepository.findByUsername(username.trim())
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    // ================= GET BY ACTION =================
    @Override
    public List<AdminAuditLogResponse> getByAction(String action) {
        if (action == null || action.trim().isEmpty()) {
            throw new BadRequestException("Action is required");
        }
        return auditLogRepository.findByAction(action.trim().toUpperCase())
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    // ================= FILTER BY DATE =================
    @Override
    public List<AdminAuditLogResponse> filter(LocalDateTime from, LocalDateTime to) {

        LocalDateTime start = (from != null) ? from : LocalDateTime.MIN;
        LocalDateTime end   = (to   != null) ? to   : LocalDateTime.now();

        if (start.isAfter(end)) {
            throw new BadRequestException("'from' date must be before 'to' date");
        }

        return auditLogRepository.findByCreatedAtBetween(start, end)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    // ================= MAPPER =================
    private AdminAuditLogResponse toResponse(AuditLog log) {
        return AdminAuditLogResponse.builder()
                .id(log.getId())
                .username(log.getUsername())
                .action(log.getAction())
                .description(log.getDescription())
                .createdAt(log.getCreatedAt())
                .build();
    }
}