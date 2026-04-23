package e_commerce.platform.modules.user.repository;
import org.springframework.data.jpa.repository.JpaRepository;

import e_commerce.platform.modules.user.entity.User;

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
}
