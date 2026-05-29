package e_commerce.platform.modules.shipping.repository;

import e_commerce.platform.modules.shipping.entity.ShippingAddress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ShippingAddressRepository extends JpaRepository<ShippingAddress, String> {

    /** Lấy tất cả địa chỉ giao hàng của một user, mới nhất trước */
    List<ShippingAddress> findByUserIdOrderByCreatedAtDesc(String userId);

    /** Kiểm tra địa chỉ có thuộc về user không — tránh truy cập chéo giữa users */
    boolean existsByIdAndUserId(String id, String userId);
}