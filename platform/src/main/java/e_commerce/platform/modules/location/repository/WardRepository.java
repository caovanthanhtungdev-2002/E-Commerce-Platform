package e_commerce.platform.modules.location.repository;

import e_commerce.platform.modules.location.entity.Ward;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface WardRepository extends JpaRepository<Ward, String> {
    List<Ward> findByDistrictCodeOrderByNameAsc(String districtCode);
}