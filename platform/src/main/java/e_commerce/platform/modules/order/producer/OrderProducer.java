package e_commerce.platform.modules.order.producer;


import lombok.RequiredArgsConstructor;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

import e_commerce.platform.modules.order.event.OrderEvent;

@Service
@RequiredArgsConstructor
public class OrderProducer {

    private final KafkaTemplate<String, Object> kafkaTemplate;

    public void sendOrderCreated(OrderEvent event) {
        kafkaTemplate.send("order-topic", event);
    }
}
