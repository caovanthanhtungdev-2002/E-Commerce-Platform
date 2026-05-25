package e_commerce.platform.modules.user.repository;

import e_commerce.platform.modules.user.entity.UserAddress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface UserAddressRepository extends JpaRepository<UserAddress, Long> {

    List<UserAddress> findByUserIdOrderByIsDefaultDescCreatedAtDesc(Long userId);

    Optional<UserAddress> findByIdAndUserId(Long id, Long userId);

    Optional<UserAddress> findByUserIdAndIsDefaultTrue(Long userId);

    int countByUserId(Long userId);

    // reset tất cả về false trước khi set default mới
    @Modifying
    @Query("UPDATE UserAddress a SET a.isDefault = false WHERE a.user.id = :userId")
    void resetDefaultByUserId(Long userId);
}