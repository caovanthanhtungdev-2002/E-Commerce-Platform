package e_commerce.platform.modules.shipping.controller;

import e_commerce.platform.modules.shipping.service.ShippingFeeCalculator;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/shipping")
@RequiredArgsConstructor
public class ShippingFeeController {

    private final ShippingFeeCalculator calculator;

    @GetMapping("/fee")
    public Map<String, Object> getFee(@RequestParam String address) {
        double fee = calculator.calculate(address);
        return Map.of(
            "fee", fee,
            "feeFormatted", String.format("%,.0fđ", fee)
        );
    }
}