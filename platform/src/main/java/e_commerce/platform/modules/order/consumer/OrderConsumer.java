package e_commerce.platform.modules.order.consumer;

import e_commerce.platform.modules.order.entity.Order;
import e_commerce.platform.modules.order.enums.OrderStatus;
import e_commerce.platform.modules.order.event.OrderEvent;
import e_commerce.platform.modules.order.repository.OrderRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class OrderConsumer {

    private final OrderRepository orderRepository;

    @KafkaListener(topics = "payment-topic", groupId = "order-group")
    @Transactional
    public void handle(OrderEvent event) {

        Order order = orderRepository.findById(event.getOrderId())
                .orElseThrow(() -> new RuntimeException("Order not found"));

        if ("PAID".equals(event.getStatus())) {
            order.setStatus(OrderStatus.PAID);
        } else {
            order.setStatus(OrderStatus.CANCELLED);
        }

        orderRepository.save(order);
    }
    
}