package e_commerce.platform.modules.payment.provider.impl;

import org.springframework.stereotype.Component;

import e_commerce.platform.modules.payment.provider.PaymentProvider;
import e_commerce.platform.modules.payment.vnpay.config.VNPayConfig;
import e_commerce.platform.modules.payment.vnpay.util.VNPayUtil;

import java.util.HashMap;
import java.util.Map;

@Component
public class VNPayProvider implements PaymentProvider {

    @Override
    public String createPaymentUrl(Long paymentId, Double amount) {

        Map<String, String> params = new HashMap<>();

        params.put("vnp_Version", "2.1.0");
        params.put("vnp_Command", "pay");
        params.put("vnp_TmnCode", VNPayConfig.TMN_CODE);
        params.put("vnp_Amount", String.valueOf((long)(amount * 100)));
        params.put("vnp_TxnRef", paymentId.toString());
        params.put("vnp_ReturnUrl", VNPayConfig.RETURN_URL);
        params.put("vnp_OrderInfo", "Pay order " + paymentId);

        String query = VNPayUtil.buildQuery(params);
        String secureHash = VNPayUtil.hmacSHA512(VNPayConfig.HASH_SECRET, query);

        return VNPayConfig.PAY_URL + "?" + query + "&vnp_SecureHash=" + secureHash;
    }

    @Override
    public boolean verifyCallback(String transactionId) {
        return true; // sẽ dùng method riêng phía dưới
    }

    public boolean verify(Map<String, String> params) {

    String receivedHash = params.get("vnp_SecureHash");

    Map<String, String> cloned = new HashMap<>(params);
    cloned.remove("vnp_SecureHash");

    String query = VNPayUtil.buildQuery(cloned);
    String calculatedHash = VNPayUtil.hmacSHA512(VNPayConfig.HASH_SECRET, query);

    return calculatedHash.equals(receivedHash);
}

}