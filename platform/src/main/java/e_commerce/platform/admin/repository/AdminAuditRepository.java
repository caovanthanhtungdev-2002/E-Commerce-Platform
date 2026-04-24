package e_commerce.platform.admin.repository;

import e_commerce.platform.modules.audit.entity.AuditLog;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface AdminAuditRepository extends JpaRepository<AuditLog, Long> {

    List<AuditLog> findByAdminUsername(String username);

    @Query("""
        SELECT a FROM AuditLog a
        WHERE a.action = :action
        ORDER BY a.createdAt DESC
    """)
    List<AuditLog> findByAction(@Param("action") String action);

    @Query("SELECT COUNT(a) FROM AuditLog a WHERE a.createdAt >= :from")
    long countRecentLogs(@Param("from") LocalDateTime from);
}