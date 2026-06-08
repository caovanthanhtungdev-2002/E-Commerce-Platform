package e_commerce.platform.modules.location.repository;

import e_commerce.platform.modules.location.entity.Province;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ProvinceRepository extends JpaRepository<Province, String> {
    List<Province> findAllByOrderByNameAsc();
}