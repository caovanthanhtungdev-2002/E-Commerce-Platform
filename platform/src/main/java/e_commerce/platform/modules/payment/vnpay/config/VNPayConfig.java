package e_commerce.platform.modules.payment.vnpay.config;

public class VNPayConfig {

    public static final String TMN_CODE = "YOUR_TMN_CODE";
    public static final String HASH_SECRET = "YOUR_SECRET";

    public static final String PAY_URL = "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html";
    public static final String RETURN_URL = "http://localhost:8080/api/payments/vnpay/callback";
}