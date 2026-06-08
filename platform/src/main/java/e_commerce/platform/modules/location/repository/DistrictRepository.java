package e_commerce.platform.modules.location.repository;

import e_commerce.platform.modules.location.entity.District;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface DistrictRepository extends JpaRepository<District, String> {
    List<District> findByProvinceCodeOrderByNameAsc(String provinceCode);
}