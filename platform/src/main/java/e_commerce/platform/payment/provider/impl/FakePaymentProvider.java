package e_commerce.platform.payment.provider.impl;

import e_commerce.platform.payment.provider.PaymentProvider;
import org.springframework.stereotype.Component;

@Component
public class FakePaymentProvider implements PaymentProvider {

    @Override
    public String createPaymentUrl(Long paymentId, Double amount) {
        return "http://localhost:8080/api/payments/callback?transactionId=" 
                + paymentId + "&success=true";
    }

    @Override
    public boolean verifyCallback(String transactionId) {
        return true; // giả lập
    }
}
