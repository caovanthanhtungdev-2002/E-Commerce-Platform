package e_commerce.platform.scheduler;

import e_commerce.platform.integration.email.EmailService;
import e_commerce.platform.modules.inventory.entity.Inventory;
import e_commerce.platform.modules.inventory.repository.InventoryRepository;
import e_commerce.platform.modules.order.enums.OrderStatus;
import e_commerce.platform.modules.order.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.javacrumbs.shedlock.spring.annotation.SchedulerLock;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class OrderCleanupScheduler {

    private final OrderRepository orderRepository;
    private final InventoryRepository inventoryRepository;
    private final EmailService emailService;

    @Value("${app.admin.email}")
    private String adminEmail;

    @Scheduled(cron = "0 */5 * * * *")
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

    @Scheduled(fixedDelay = 40_000)
    @SchedulerLock(
        name = "auto_confirm_paid_orders",
        lockAtMostFor = "55s",
        lockAtLeastFor = "10s"
    )
    @Transactional
    public void autoConfirmPaidOrders() {
        LocalDateTime cutoff = LocalDateTime.now().minusMinutes(5);
        int updated = orderRepository.confirmPaidOrders(
            OrderStatus.PAID,
            cutoff,
            OrderStatus.CONFIRMED
        );
        if (updated > 0) log.info("Auto-confirmed {} paid orders", updated);
    }

//  @Scheduled(cron = "0 */1 * * * *")
// @SchedulerLock(
//     name = "notify_low_stock",
//     lockAtMostFor = "50s",
//     lockAtLeastFor = "10s"
// ) 
@Scheduled(cron = "0 0 8 * * *")
@SchedulerLock(
    name = "notify_low_stock",
    lockAtMostFor = "5m",
    lockAtLeastFor = "1m"
)
    @Transactional
    public void notifyLowStock() {
        List<Inventory> lowStock = inventoryRepository.findByAvailableLessThan(10);
        if (lowStock.isEmpty()) return;

        StringBuilder sb = new StringBuilder();
        sb.append("Cảnh báo tồn kho thấp:\n\n");
        lowStock.forEach(inv -> sb.append(String.format(
            "- %s: khả dụng = %d (tồn = %d, đang giữ = %d)\n",
            inv.getProduct().getName(),
            inv.getStock() - inv.getReserved(),
            inv.getStock(),
            inv.getReserved()
        )));

        emailService.send(adminEmail, "⚠️ Cảnh báo tồn kho thấp", sb.toString());
        log.info("Sent low stock alert for {} products", lowStock.size());
    }
}