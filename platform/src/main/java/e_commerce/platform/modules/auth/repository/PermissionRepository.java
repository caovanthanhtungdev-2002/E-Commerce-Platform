
package e_commerce.platform.modules.auth.repository;

import e_commerce.platform.modules.auth.entity.Permission;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PermissionRepository extends JpaRepository<Permission, Long> {

    Optional<Permission> findByName(String name);

    List<Permission> findByResource(String resource);
}