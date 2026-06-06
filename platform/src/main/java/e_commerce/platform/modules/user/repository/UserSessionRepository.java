
package e_commerce.platform.modules.user.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import e_commerce.platform.modules.user.entity.UserSession;

public interface UserSessionRepository extends JpaRepository<UserSession, Long> {

    Optional<UserSession> findByToken(String token);

    List<UserSession> findByUserIdAndActiveTrue(Long userId);

    boolean existsByTokenAndActiveTrue(String token);
    
    @Modifying
    @Query("UPDATE UserSession s SET s.active = false WHERE s.user.id = :userId")
    void deactivateAllByUserId(Long userId);
}