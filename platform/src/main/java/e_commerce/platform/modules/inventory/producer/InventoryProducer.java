package e_commerce.platform.modules.inventory.producer;

import e_commerce.platform.modules.inventory.event.InventoryEvent;
import lombok.RequiredArgsConstructor;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class InventoryProducer {

    private final KafkaTemplate<String, Object> kafkaTemplate;

    public void send(InventoryEvent event) {
        kafkaTemplate.send("inventory-topic", event);
    }
}