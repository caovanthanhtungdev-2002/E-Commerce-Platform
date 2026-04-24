package e_commerce.platform.modules.user.repository;
import org.springframework.data.jpa.repository.JpaRepository;

import e_commerce.platform.modules.user.entity.User;
import org.springframework.data.domain.Page;      
import org.springframework.data.domain.Pageable;
import e_commerce.platform.modules.auth.enums.Role;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    //tìm theo username (login)
    Optional<User> findByUsername(String username);
    
    // kiểm tra username tồn tại
    boolean existsByUsername(String username);

    // kiểm tra phone tồn tại
    boolean existsByPhone(String phone);

    // tìm theo email (OTP reset password)
    Optional<User> findByEmail(String email);

    // kiểm tra email tồn tại
    boolean existsByEmail(String email);

    Page<User> findByUsernameContainingIgnoreCaseOrEmailContainingIgnoreCase(
    String username, String email, Pageable pageable
);

    List<User> findByRole(Role role);
}
