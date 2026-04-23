package e_commerce.platform.modules.payment.provider;

public interface PaymentProvider {

    String createPaymentUrl(Long paymentId, Double amount);

    boolean verifyCallback(String transactionId);
}