package e_commerce.platform.payment.consumer;

import org.springframework.kafka.annotation.KafkaListener;
import lombok.RequiredArgsConstructor;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

import e_commerce.platform.modules.order.event.OrderEvent;

@Service
@RequiredArgsConstructor
public class PaymentConsumer {

    private final KafkaTemplate<String, Object> kafkaTemplate;

    @KafkaListener(topics = "order-topic", groupId = "payment-group")
    public void handle(OrderEvent event) {

        boolean success = true; // giả lập

        if (success) {
            event.setStatus("PAID");
            kafkaTemplate.send("payment-topic", event);
        } else {
            event.setStatus("FAILED");
            kafkaTemplate.send("payment-topic", event);
        }
    }
}
