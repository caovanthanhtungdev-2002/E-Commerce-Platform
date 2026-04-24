package e_commerce.platform.modules.config.repository;

import e_commerce.platform.modules.config.entity.SystemConfig;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SystemConfigRepository extends JpaRepository<SystemConfig, String> {
}