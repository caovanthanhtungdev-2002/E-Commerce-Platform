package e_commerce.platform.modules.inventory.consumer;

import e_commerce.platform.modules.inventory.event.InventoryEvent;
import e_commerce.platform.modules.inventory.producer.InventoryProducer;
import e_commerce.platform.modules.order.event.OrderEvent;

import lombok.RequiredArgsConstructor;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class PaymentResultConsumer {

    private final InventoryProducer inventoryProducer;

    @KafkaListener(topics = "payment-topic", groupId = "inventory-group")
    public void handle(OrderEvent event) {

        if ("PAID".equals(event.getStatus())) {

            inventoryProducer.send(
                    InventoryEvent.builder()
                            .productId(event.getProductId())
                            .quantity(event.getQuantity())
                            .type("CONFIRM")
                            .build()
            );

        } else {

            inventoryProducer.send(
                    InventoryEvent.builder()
                            .productId(event.getProductId())
                            .quantity(event.getQuantity())
                            .type("RELEASE")
                            .build()
            );
        }
    }
}