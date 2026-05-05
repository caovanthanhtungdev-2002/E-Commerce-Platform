package e_commerce.platform.modules.payment.provider.impl;

import org.springframework.stereotype.Component;

import e_commerce.platform.modules.payment.provider.PaymentProvider;
import e_commerce.platform.modules.payment.vnpay.config.VNPayConfig;
import e_commerce.platform.modules.payment.vnpay.util.VNPayUtil;

import java.text.SimpleDateFormat;
import java.util.*;

@Component
public class VNPayProvider implements PaymentProvider {

    /**
     * Tạo URL thanh toán VNPAY.
     *
     * @param paymentId ID của Payment entity (dùng làm vnp_TxnRef)
     * @param orderId   ID của Order thật (để frontend navigate đúng sau callback)
     * @param amount    Số tiền (VND, chưa nhân 100)
     */
    public String createPaymentUrl(Long paymentId, Long orderId, Double amount) {

        Map<String, String> params = new HashMap<>();

        // Amount: VNPAY yêu cầu nhân 100
        long amountLong = Math.round(amount * 100);

        // Thời gian GMT+7
        Calendar cld = Calendar.getInstance(TimeZone.getTimeZone("Asia/Ho_Chi_Minh"));
        SimpleDateFormat formatter = new SimpleDateFormat("yyyyMMddHHmmss");
        formatter.setTimeZone(TimeZone.getTimeZone("Asia/Ho_Chi_Minh"));

        String createDate = formatter.format(cld.getTime());
        cld.add(Calendar.MINUTE, 15);
        String expireDate = formatter.format(cld.getTime());

        params.put("vnp_Version",   "2.1.0");
        params.put("vnp_Command",   "pay");
        params.put("vnp_TmnCode",   VNPayConfig.TMN_CODE);
        params.put("vnp_Amount",    String.valueOf(amountLong));
        params.put("vnp_CurrCode",  "VND");
        params.put("vnp_TxnRef",    paymentId.toString());          
        params.put("vnp_OrderInfo", "Thanh toan don hang " + orderId); 
        params.put("vnp_OrderType", "billpayment");
        params.put("vnp_Locale",    "vn");
        params.put("vnp_ReturnUrl", VNPayConfig.RETURN_URL);
        params.put("vnp_IpAddr",    "127.0.0.1");
        params.put("vnp_CreateDate",createDate);
        params.put("vnp_ExpireDate",expireDate);

        // Tính chữ ký
        String hashData  = VNPayUtil.buildHashData(params);
        String secureHash = VNPayUtil.hmacSHA512(VNPayConfig.HASH_SECRET, hashData);

        System.out.println("=========== VNPAY DEBUG ===========");
        System.out.println("HASH DATA: "    + hashData);
        System.out.println("SECURE HASH: "  + secureHash);
        System.out.println("HASH LENGTH: "  + secureHash.length()); 

        String query = VNPayUtil.buildQuery(params);
        return VNPayConfig.PAY_URL + "?" + query + "&vnp_SecureHash=" + secureHash;
    }

    @Override
    public String createPaymentUrl(Long paymentId, Double amount) {
        
        throw new UnsupportedOperationException("Dùng createPaymentUrl(paymentId, orderId, amount) thay thế");
    }

    @Override
    public boolean verifyCallback(String transactionId) {
        return true;
    }

    /**
     * Xác minh chữ ký callback từ VNPAY.
     * Spring đã tự URL-decode params trước khi đưa vào Map,
     * nên buildHashData phải encode lại để tính hash đúng.
     */
    public boolean verify(Map<String, String> params) {
        String receivedHash = params.get("vnp_SecureHash");
        if (receivedHash == null) return false;

        Map<String, String> cloned = new HashMap<>(params);
        cloned.remove("vnp_SecureHash");
        cloned.remove("vnp_SecureHashType");

        String hashData       = VNPayUtil.buildHashData(cloned);
        String calculatedHash = VNPayUtil.hmacSHA512(VNPayConfig.HASH_SECRET, hashData);

        System.out.println("=========== VNPAY VERIFY ===========");
        System.out.println("RECEIVED HASH:    " + receivedHash);
        System.out.println("CALCULATED HASH:  " + calculatedHash);
        System.out.println("MATCH: " + calculatedHash.equalsIgnoreCase(receivedHash));

        return calculatedHash.equalsIgnoreCase(receivedHash);
    }
}