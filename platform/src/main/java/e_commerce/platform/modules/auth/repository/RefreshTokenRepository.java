package e_commerce.platform.modules.auth.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

import e_commerce.platform.modules.auth.entity.RefreshToken;

public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {

    Optional<RefreshToken> findByToken(String token);
}
