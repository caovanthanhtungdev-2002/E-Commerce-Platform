package e_commerce.platform.admin.service;

import e_commerce.platform.modules.payment.entity.Payment;
import e_commerce.platform.modules.payment.enums.PaymentStatus;

import java.util.List;

public interface AdminPaymentService {

    List<Payment> getPayments(int page, int size);

    Payment getPaymentById(Long id);

    List<Payment> getPaymentsByStatus(PaymentStatus status);

    /**
     * Refund một payment SUCCESS — cập nhật status -> REFUNDED, Order -> CANCELLED.
     * Thực tế cần gọi thêm VNPay Refund API.
     */
    void refundPayment(Long paymentId);

    /**
     * Admin manually mark payment PENDING -> FAILED (dành cho case stuck).
     * Đồng thời rollback Order -> CANCELLED.
     */
    void markPaymentFailed(Long paymentId);

    /**
     * Chỉ xóa được payment PENDING hoặc FAILED.
     * Payment SUCCESS / REFUNDED phải giữ để audit tài chính.
     */
    void deletePayment(Long paymentId);
}