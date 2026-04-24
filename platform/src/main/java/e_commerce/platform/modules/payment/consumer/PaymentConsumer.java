package e_commerce.platform.modules.payment.consumer;

import e_commerce.platform.modules.order.event.OrderEvent;
import e_commerce.platform.modules.payment.producer.PaymentProducer;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

/**
 * PaymentConsumer: lắng nghe "order-topic", simulate payment, gửi kết quả qua PaymentProducer.
 *
 * Lưu ý: trong luồng thực tế với VNPay, PaymentConsumer KHÔNG xử lý thanh toán.
 * Thanh toán do VNPay callback xử lý trong PaymentServiceImpl.
 *
 * Consumer này phù hợp cho:
 *   - Internal payment (wallet, credit)
 *   - Async simulation / testing
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class PaymentConsumer {

    private final PaymentProducer paymentProducer;

    @KafkaListener(topics = "order-topic", groupId = "payment-group")
    public void handle(OrderEvent event) {
        log.info("[PAYMENT_CONSUMER] Received OrderEvent: orderId={}, status={}", event.getOrderId(), event.getStatus());

        try {
            // TODO: thay bằng logic thanh toán thực (internal wallet, etc.)
            boolean success = processPayment(event);

            event.setStatus(success ? "PAID" : "FAILED");

        } catch (Exception e) {
            log.error("[PAYMENT_CONSUMER] Error processing payment for orderId={}: {}", event.getOrderId(), e.getMessage());
            event.setStatus("FAILED");
        }

        paymentProducer.sendPaymentResult(event);
    }

    /**
     * Placeholder cho logic thanh toán nội bộ.
     * Với VNPay thì luồng này KHÔNG được dùng — VNPay callback xử lý trực tiếp.
     */
    private boolean processPayment(OrderEvent event) {
        // TODO: implement internal payment logic
        return true;
    }
}