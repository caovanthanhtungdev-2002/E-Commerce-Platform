package e_commerce.platform.modules.payment.vnpay.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

@Configuration
public class VNPayConfig {

    @Value("${vnpay.tmn-code}")
    public String tmnCode;

    @Value("${vnpay.hash-secret}")
    public String hashSecret;

    @Value("${vnpay.pay-url}")
    public String payUrl;

    @Value("${vnpay.return-url}")
    public String returnUrl;
}