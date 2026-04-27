package e_commerce.platform.admin.event;

import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class AdminEventListener {

    @EventListener
    public void handle(AdminEvent event) {

        log.info("[EVENT LISTENER] {} - {} - {}",
                event.getType(),
                event.getActor(),
                event.getDescription()
        );

        // TODO:
        // - save audit log
        // - send notification
        // - push kafka / redis
    }
}