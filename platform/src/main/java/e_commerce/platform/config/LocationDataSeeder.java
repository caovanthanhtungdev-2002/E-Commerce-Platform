package e_commerce.platform.config;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import e_commerce.platform.modules.location.entity.District;
import e_commerce.platform.modules.location.entity.Province;
import e_commerce.platform.modules.location.entity.Ward;
import e_commerce.platform.modules.location.repository.DistrictRepository;
import e_commerce.platform.modules.location.repository.ProvinceRepository;
import e_commerce.platform.modules.location.repository.WardRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;


import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;

@Component
@Order(1)
@RequiredArgsConstructor
@Slf4j
public class LocationDataSeeder implements ApplicationRunner {

    private final ProvinceRepository provinceRepo;
    private final DistrictRepository districtRepo;
    private final WardRepository wardRepo;

    @Override
public void run(ApplicationArguments args) throws Exception {
    if (provinceRepo.count() > 0) return;

    log.info("[SEED] Seeding location data...");

    ObjectMapper mapper = new ObjectMapper();
    JsonNode root = mapper.readTree(
    new InputStreamReader(
        new ClassPathResource("data/data.json").getInputStream(),
        StandardCharsets.UTF_8
    )
);

    for (JsonNode p : root) {
        try {
            if (p.get("Id") == null || p.get("Name") == null) continue;

            Province province = Province.builder()
                .code(p.get("Id").asText())
                .name(p.get("Name").asText())
                .region(detectRegion(p.get("Name").asText()))
                .build();
            provinceRepo.save(province);

            JsonNode districts = p.get("Districts");
            if (districts == null) continue;

            for (JsonNode d : districts) {
                try {
                    if (d.get("Id") == null || d.get("Name") == null) continue;

                    District district = District.builder()
                        .code(d.get("Id").asText())
                        .name(d.get("Name").asText())
                        .province(province)
                        .build();
                    districtRepo.save(district);

                    JsonNode wards = d.get("Wards");
                    if (wards == null) continue;

                    for (JsonNode w : wards) {
                        try {
                            if (w.get("Id") == null || w.get("Name") == null) continue;

                            Ward ward = Ward.builder()
                                .code(w.get("Id").asText())
                                .name(w.get("Name").asText())
                                .district(district)
                                .build();
                            wardRepo.save(ward);
                        } catch (Exception e) {
                            log.warn("[SEED] Skip ward: {}", e.getMessage());
                        }
                    }
                } catch (Exception e) {
                    log.warn("[SEED] Skip district: {}", e.getMessage());
                }
            }
        } catch (Exception e) {
            log.error("[SEED] Skip province: {}", e.getMessage());
        }
    }

    log.info("[SEED] Done!");
}

    private String detectRegion(String name) {
    String n = normalize(name); 

    // Miền Nam
    if (n.contains("ho chi minh") || n.contains("binh duong") || n.contains("dong nai")
        || n.contains("ba ria") || n.contains("long an") || n.contains("tien giang")
        || n.contains("ben tre") || n.contains("can tho") || n.contains("an giang")
        || n.contains("kien giang") || n.contains("dong thap") || n.contains("vinh long")
        || n.contains("tra vinh") || n.contains("soc trang") || n.contains("bac lieu")
        || n.contains("ca mau") || n.contains("hau giang") || n.contains("tay ninh")
        || n.contains("binh phuoc")) {
        return "SOUTH";
    }

    // Miền Trung + Tây Nguyên
    if (n.contains("da nang") || n.contains("thua thien") || n.contains("quang")
        || n.contains("binh dinh") || n.contains("phu yen") || n.contains("khanh hoa")
        || n.contains("ninh thuan") || n.contains("binh thuan") || n.contains("kon tum")
        || n.contains("gia lai") || n.contains("dak") || n.contains("thanh hoa")
        || n.contains("nghe an") || n.contains("ha tinh") || n.contains("quang binh")
        || n.contains("quang tri") || n.contains("lam dong")) {
        return "CENTRAL";
    }

    // Còn lại Miền Bắc
    return "NORTH";
}

private String normalize(String str) {
    return java.text.Normalizer
        .normalize(str, java.text.Normalizer.Form.NFD)
        .replaceAll("\\p{InCombiningDiacriticalMarks}+", "")
        .replace("đ", "d").replace("Đ", "D")
        .toLowerCase();
}
}