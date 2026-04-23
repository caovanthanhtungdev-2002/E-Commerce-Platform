package e_commerce.platform.scheduler;


import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class ReviewScheduler {

    @Scheduled(fixedRate = 300000)
    public void updateRatings() {
        System.out.println("Update product rating...");
    }
}
