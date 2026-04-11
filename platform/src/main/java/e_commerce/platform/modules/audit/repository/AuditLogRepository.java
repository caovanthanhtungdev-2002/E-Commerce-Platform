package e_commerce.platform.modules.audit.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import e_commerce.platform.modules.audit.entity.AuditLog;

public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {
}