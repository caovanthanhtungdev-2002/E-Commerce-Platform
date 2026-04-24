package e_commerce.platform.modules.audit.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import e_commerce.platform.modules.audit.entity.AuditLog;

import java.time.LocalDateTime;
import java.util.List;

public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {

    Page<AuditLog> findAll(Pageable pageable);

    List<AuditLog> findByAdminUsername(String admin);

    List<AuditLog> findByAction(String action);

    List<AuditLog> findByUsername(String username);

    List<AuditLog> findByCreatedAtBetween(LocalDateTime from, LocalDateTime to);
}