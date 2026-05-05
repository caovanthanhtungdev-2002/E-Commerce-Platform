package e_commerce.platform.modules.payment.provider.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import e_commerce.platform.modules.payment.provider.PaymentProvider;
import e_commerce.platform.modules.payment.vnpay.config.VNPayConfig;
import e_commerce.platform.modules.payment.vnpay.util.VNPayUtil;

import java.text.SimpleDateFormat;
import java.util.*;

@Component
@RequiredArgsConstructor
public class VNPayProvider implements PaymentProvider {

    private final VNPayConfig config;

    public String createPaymentUrl(Long paymentId, Long orderId, Double amount) {

        Map<String, String> params = new HashMap<>();

        long amountLong = Math.round(amount * 100);

        Calendar cld = Calendar.getInstance(TimeZone.getTimeZone("Asia/Ho_Chi_Minh"));
        SimpleDateFormat formatter = new SimpleDateFormat("yyyyMMddHHmmss");
        formatter.setTimeZone(TimeZone.getTimeZone("Asia/Ho_Chi_Minh"));

        String createDate = formatter.format(cld.getTime());
        cld.add(Calendar.MINUTE, 15);
        String expireDate = formatter.format(cld.getTime());

        params.put("vnp_Version", "2.1.0");
        params.put("vnp_Command", "pay");
        params.put("vnp_TmnCode", config.tmnCode);                
        params.put("vnp_Amount", String.valueOf(amountLong));
        params.put("vnp_CurrCode", "VND");
        params.put("vnp_TxnRef", paymentId.toString());
        params.put("vnp_OrderInfo", "Thanh toan don hang " + orderId);
        params.put("vnp_OrderType", "billpayment");
        params.put("vnp_Locale", "vn");
        params.put("vnp_ReturnUrl", config.returnUrl);            
        params.put("vnp_IpAddr", "127.0.0.1");
        params.put("vnp_CreateDate", createDate);
        params.put("vnp_ExpireDate", expireDate);

        String hashData = VNPayUtil.buildHashData(params);
        String secureHash = VNPayUtil.hmacSHA512(config.hashSecret, hashData); 

        String query = VNPayUtil.buildQuery(params);

        return config.payUrl + "?" + query + "&vnp_SecureHash=" + secureHash; 
    }

    @Override
    public String createPaymentUrl(Long paymentId, Double amount) {
        throw new UnsupportedOperationException("Dùng createPaymentUrl(paymentId, orderId, amount)");
    }

    @Override
    public boolean verifyCallback(String transactionId) {
        return true;
    }

    public boolean verify(Map<String, String> params) {
        String receivedHash = params.get("vnp_SecureHash");
        if (receivedHash == null) return false;

        Map<String, String> cloned = new HashMap<>(params);
        cloned.remove("vnp_SecureHash");
        cloned.remove("vnp_SecureHashType");

        String hashData = VNPayUtil.buildHashData(cloned);
        String calculatedHash = VNPayUtil.hmacSHA512(config.hashSecret, hashData); 
        return calculatedHash.equalsIgnoreCase(receivedHash);
    }
}