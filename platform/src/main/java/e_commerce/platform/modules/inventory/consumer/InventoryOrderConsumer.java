package e_commerce.platform.modules.inventory.consumer;

import e_commerce.platform.modules.inventory.service.InventoryService;
import e_commerce.platform.modules.order.event.OrderEvent;

import lombok.RequiredArgsConstructor;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class InventoryOrderConsumer {

    private final InventoryService inventoryService;

    @KafkaListener(topics = "order-topic", groupId = "inventory-group")
    public void handle(OrderEvent event) {

        if ("CREATED".equals(event.getStatus())) {
            inventoryService.reserveStock(
                    event.getProductId(),
                    event.getQuantity()
            );
        }
    }
}