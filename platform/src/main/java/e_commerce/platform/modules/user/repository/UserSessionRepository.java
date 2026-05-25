
package e_commerce.platform.modules.user.repository;

import e_commerce.platform.modules.user.entity.UserSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface UserSessionRepository extends JpaRepository<UserSession, Long> {

    Optional<UserSession> findByToken(String token);

    List<UserSession> findByUserIdAndActiveTrue(Long userId);

    @Modifying
    @Query("UPDATE UserSession s SET s.active = false WHERE s.user.id = :userId")
    void deactivateAllByUserId(Long userId);
}