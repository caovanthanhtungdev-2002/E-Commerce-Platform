package e_commerce.platform.modules.shipping.service;

import e_commerce.platform.modules.location.repository.ProvinceRepository;
import e_commerce.platform.modules.shipping.repository.ShippingFeeConfigRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import e_commerce.platform.modules.shipping.entity.ShippingFeeConfig;
import e_commerce.platform.modules.location.entity.Province;
import java.util.Comparator;

import java.text.Normalizer;


@Component
@RequiredArgsConstructor
public class ShippingFeeCalculator {

    private final ShippingFeeConfigRepository feeConfigRepo;
    private final ProvinceRepository provinceRepo;

    private static final double DEFAULT_FEE = 30_000.0;

    public double calculate(String address) {
    if (address == null || address.isBlank()) return DEFAULT_FEE;

    String normalized = normalize(address);
    System.out.println(">>> normalized address: " + normalized);

    return provinceRepo.findAllByOrderByNameAsc().stream()
        .sorted(Comparator.comparingInt((Province p) -> p.getName().length()).reversed())
        .peek(p -> System.out.println(">>> province raw: [" + p.getName() + "] normalized: [" + normalize(p.getName()) + "]"))
        .filter(p -> {
            String pName = normalize(p.getName());
            boolean match = normalized.contains(pName) || pName.contains(normalized);
            if (match) System.out.println(">>> matched province: " + p.getName() + " | region: " + p.getRegion());
            return match;
        })
        .findFirst()
        .map(p -> feeConfigRepo.findByRegion(p.getRegion())
            .map(ShippingFeeConfig::getFee)
            .orElse(DEFAULT_FEE))
        .orElse(DEFAULT_FEE);
}            

    private String normalize(String str) {
        return Normalizer
            .normalize(str, Normalizer.Form.NFD)
            .replaceAll("\\p{InCombiningDiacriticalMarks}+", "")
            .replace("đ", "d").replace("Đ", "D")
            .toLowerCase();
    }
}