package e_commerce.platform.admin.controller;

import e_commerce.platform.admin.dto.response.AdminAuditLogResponse;
import e_commerce.platform.admin.service.AdminAuditService;

import lombok.RequiredArgsConstructor;

import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/admin/audit")
@RequiredArgsConstructor
public class AdminAuditController {

    private final AdminAuditService adminAuditService; 
    @GetMapping
    public List<AdminAuditLogResponse> getLogs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        return adminAuditService.getLogs(page, size);
    }

    @GetMapping("/admin/{username}")
    public List<AdminAuditLogResponse> getByAdmin(@PathVariable String username) {
        return adminAuditService.getByUsername(username);
    }

    @GetMapping("/action/{action}")
    public List<AdminAuditLogResponse> getByAction(@PathVariable String action) {
        return adminAuditService.getByAction(action);
    }

    @GetMapping("/filter")
    public List<AdminAuditLogResponse> filter(
            @RequestParam(required = false) LocalDateTime from,
            @RequestParam(required = false) LocalDateTime to) {

        return adminAuditService.filter(from, to);
    }
}