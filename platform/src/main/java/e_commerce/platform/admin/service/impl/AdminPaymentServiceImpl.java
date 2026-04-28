package e_commerce.platform.admin.service.impl;

import e_commerce.platform.admin.service.AdminPaymentService;
import e_commerce.platform.exception.BadRequestException;
import e_commerce.platform.exception.ResourceNotFoundException;
import e_commerce.platform.modules.order.entity.Order;
import e_commerce.platform.modules.order.enums.OrderStatus;
import e_commerce.platform.modules.order.repository.OrderRepository;
import e_commerce.platform.modules.payment.entity.Payment;
import e_commerce.platform.modules.payment.enums.PaymentStatus;
import e_commerce.platform.modules.payment.producer.PaymentProducer;
import e_commerce.platform.modules.payment.repository.PaymentRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class AdminPaymentServiceImpl implements AdminPaymentService {

    private final PaymentRepository paymentRepository;
    private final OrderRepository orderRepository;
    private final PaymentProducer paymentProducer;

    private static final int MAX_PAGE_SIZE = 100;

    // ================= VALIDATE PAGINATION =================
    private Pageable buildPageable(int page, int size) {
        if (page < 0) {
            throw new BadRequestException("Page index must not be negative");
        }
        if (size <= 0 || size > MAX_PAGE_SIZE) {
            throw new BadRequestException("Page size must be between 1 and " + MAX_PAGE_SIZE);
        }
        return PageRequest.of(page, size);
    }

    // ================= GET ALL =================
    @Override
    @Transactional(readOnly = true)
    public List<Payment> getPayments(int page, int size) {
        Pageable pageable = buildPageable(page, size);
        List<Payment> payments = paymentRepository.findAll(pageable).getContent();
        log.info("[ADMIN] getPayments: page={}, size={}, result={}", page, size, payments.size());
        return payments;
    }

    // ================= GET BY ID =================
    @Override
    @Transactional(readOnly = true)
    public Payment getPaymentById(Long id) {
        if (id == null || id <= 0) {
            throw new BadRequestException("Invalid payment ID");
        }
        return paymentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found with id: " + id));
    }

    // ================= GET BY STATUS =================
    @Override
    @Transactional(readOnly = true)
    public List<Payment> getPaymentsByStatus(PaymentStatus status) {
        if (status == null) {
            throw new BadRequestException("Payment status is required");
        }
        List<Payment> payments = paymentRepository.findByStatus(status);
        log.info("[ADMIN] getPaymentsByStatus: status={}, result={}", status, payments.size());
        return payments;
    }

    // ================= REFUND =================
    /**
     * Admin refund: chỉ được refund payment SUCCESS.
     * Đồng thời rollback Order về CANCELLED.
     *
     * Lưu ý thực tế: cần gọi thêm VNPay Refund API,
     * hiện tại chỉ cập nhật trạng thái nội bộ.
     */
    @Override
    public void refundPayment(Long paymentId) {
        Payment payment = getPaymentById(paymentId);

        if (payment.getStatus() != PaymentStatus.SUCCESS) {
            throw new BadRequestException(
                    "Only SUCCESS payments can be refunded. Current status: " + payment.getStatus()
            );
        }

        payment.setStatus(PaymentStatus.REFUNDED);
        paymentRepository.save(payment);

        // Sync order status
        orderRepository.findById(payment.getOrderId()).ifPresent(order -> {
            order.setStatus(OrderStatus.CANCELLED);
            orderRepository.save(order);
            log.info("[ADMIN] refundPayment: orderId={} -> CANCELLED", order.getId());
        });

        log.info("[ADMIN] refundPayment: paymentId={}, transactionId={}", paymentId, payment.getTransactionId());
    }

    // ================= MARK FAILED =================
    /**
     * Admin manually mark payment as FAILED (dành cho các case stuck PENDING).
     * Đồng thời rollback Order về CANCELLED.
     */
    @Override
    public void markPaymentFailed(Long paymentId) {
        Payment payment = getPaymentById(paymentId);

        if (payment.getStatus() == PaymentStatus.SUCCESS) {
            throw new BadRequestException("Cannot mark a SUCCESS payment as FAILED. Use refund instead.");
        }
        if (payment.getStatus() == PaymentStatus.FAILED) {
            throw new BadRequestException("Payment is already FAILED");
        }

        payment.setStatus(PaymentStatus.FAILED);
        paymentRepository.save(payment);

        // Sync order status
        orderRepository.findById(payment.getOrderId()).ifPresent(order -> {
            if (order.getStatus() != OrderStatus.CANCELLED) {
                order.setStatus(OrderStatus.CANCELLED);
                orderRepository.save(order);
                log.info("[ADMIN] markPaymentFailed: orderId={} -> CANCELLED", order.getId());
            }
        });

        log.info("[ADMIN] markPaymentFailed: paymentId={}", paymentId);
    }

    // ================= DELETE =================
    /**
     * Chỉ cho phép xóa payment FAILED hoặc PENDING.
     * Payment SUCCESS / REFUNDED phải giữ lại để audit.
     */
    @Override
    public void deletePayment(Long paymentId) {
        Payment payment = getPaymentById(paymentId);

        if (payment.getStatus() == PaymentStatus.SUCCESS
                || payment.getStatus() == PaymentStatus.REFUNDED) {
            throw new BadRequestException(
                    "Cannot delete a " + payment.getStatus() + " payment. Financial records must be retained."
            );
        }

        paymentRepository.deleteById(paymentId);
        log.info("[ADMIN] deletePayment: paymentId={}, status={}", paymentId, payment.getStatus());
    }
}
