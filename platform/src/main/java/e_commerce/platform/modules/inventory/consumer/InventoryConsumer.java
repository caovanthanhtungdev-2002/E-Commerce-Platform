package e_commerce.platform.modules.inventory.consumer;

import e_commerce.platform.modules.inventory.event.InventoryEvent;
import e_commerce.platform.modules.inventory.service.InventoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class InventoryConsumer {

    private final InventoryService inventoryService;

    @KafkaListener(topics = "inventory-topic", groupId = "inventory-group")
    public void handle(InventoryEvent event) {

        switch (event.getType()) {

            case "RESERVE" ->
                inventoryService.reserveStock(event.getProductId(), event.getQuantity());

            case "CONFIRM" ->
                inventoryService.confirmOrder(event.getProductId(), event.getQuantity());

            case "RELEASE" ->
                inventoryService.releaseStock(event.getProductId(), event.getQuantity());
        }
    }
}