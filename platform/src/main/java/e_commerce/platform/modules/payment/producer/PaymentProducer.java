package e_commerce.platform.modules.payment.producer;

import e_commerce.platform.modules.order.event.OrderEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.support.SendResult;
import org.springframework.stereotype.Service;

import java.util.concurrent.CompletableFuture;

/**
 * PaymentProducer: publish payment result event lên Kafka topic "payment-topic".
 *
 * Flow:
 *   VNPay callback → PaymentServiceImpl → PaymentProducer.sendPaymentResult()
 *                                             → "payment-topic"
 *                                             → OrderConsumer (cập nhật order)
 *                                             → NotificationConsumer (gửi email)
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class PaymentProducer {

    private final KafkaTemplate<String, Object> kafkaTemplate;

    private static final String PAYMENT_TOPIC = "payment-topic";

    /**
     * Gửi kết quả thanh toán lên Kafka.
     * @param event OrderEvent đã được set status = "PAID" hoặc "FAILED"
     */
    public void sendPaymentResult(OrderEvent event) {
        CompletableFuture<SendResult<String, Object>> future =
                kafkaTemplate.send(PAYMENT_TOPIC, String.valueOf(event.getOrderId()), event);

        future.whenComplete((result, ex) -> {
            if (ex != null) {
                log.error("[PAYMENT_PRODUCER] Failed to send event for orderId={}: {}",
                        event.getOrderId(), ex.getMessage());
                // TODO: lưu vào outbox table hoặc retry queue để tránh mất event
            } else {
                log.info("[PAYMENT_PRODUCER] Sent event for orderId={}, status={}, partition={}, offset={}",
                        event.getOrderId(),
                        event.getStatus(),
                        result.getRecordMetadata().partition(),
                        result.getRecordMetadata().offset());
            }
        });
    }
}
