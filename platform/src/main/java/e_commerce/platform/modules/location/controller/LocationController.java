package e_commerce.platform.modules.location.controller;

import e_commerce.platform.modules.location.dto.LocationDTO;
import e_commerce.platform.modules.location.repository.DistrictRepository;
import e_commerce.platform.modules.location.repository.ProvinceRepository;
import e_commerce.platform.modules.location.repository.WardRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/location")
@RequiredArgsConstructor
public class LocationController {

    private final ProvinceRepository provinceRepo;
    private final DistrictRepository districtRepo;
    private final WardRepository wardRepo;

    @GetMapping("/provinces")
    public List<LocationDTO> getProvinces() {
        return provinceRepo.findAllByOrderByNameAsc()
            .stream()
            .map(p -> new LocationDTO(p.getCode(), p.getName()))
            .toList();
    }

    @GetMapping("/districts")
    public List<LocationDTO> getDistricts(@RequestParam String provinceCode) {
        return districtRepo.findByProvinceCodeOrderByNameAsc(provinceCode)
            .stream()
            .map(d -> new LocationDTO(d.getCode(), d.getName()))
            .toList();
    }

    @GetMapping("/wards")
    public List<LocationDTO> getWards(@RequestParam String districtCode) {
        return wardRepo.findByDistrictCodeOrderByNameAsc(districtCode)
            .stream()
            .map(w -> new LocationDTO(w.getCode(), w.getName()))
            .toList();
    }
}