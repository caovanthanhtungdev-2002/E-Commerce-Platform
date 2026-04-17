package e_commerce.platform.modules.user.repository;
import org.springframework.data.jpa.repository.JpaRepository;

import e_commerce.platform.modules.user.entity.User;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
    boolean existsByUsername(String username);
    boolean existsByPhone(String phone);
}
