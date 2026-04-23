package e_commerce.platform.scheduler;


import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;


import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import net.javacrumbs.shedlock.spring.annotation.SchedulerLock;

@Slf4j
@Component
@RequiredArgsConstructor
public class InventoryRetryScheduler {

    @Scheduled(fixedRate = 60000) // mỗi 1 phút
    @SchedulerLock(name = "retry_inventory")
    public void retryFailedJobs() {

        log.info("Running inventory retry job...");

        // TODO:
        // retry inventory fail nếu có
    }
}