package e_commerce.platform.scheduler;

import java.time.LocalDateTime;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import e_commerce.platform.modules.order.enums.OrderStatus;
import e_commerce.platform.modules.order.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.javacrumbs.shedlock.spring.annotation.SchedulerLock;

@Slf4j
@Component
@RequiredArgsConstructor
public class OrderCleanupScheduler {

    private final OrderRepository orderRepository;

    @Scheduled(cron = "0 */5 * * * *") // mỗi 5 phút
    @SchedulerLock(name = "cleanup_pending_orders")
    @Transactional
    public void cancelExpiredOrders() {

        LocalDateTime threshold = LocalDateTime.now().minusMinutes(30);

        int updated = orderRepository.cancelExpiredOrders(
                OrderStatus.PENDING,
                threshold,
                OrderStatus.CANCELLED
        );

        log.info("Cancelled {} expired orders", updated);
    }
}