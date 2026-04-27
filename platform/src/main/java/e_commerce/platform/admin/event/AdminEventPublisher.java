package e_commerce.platform.admin.event;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class AdminEventPublisher {

    private final ApplicationEventPublisher publisher;

    // ================= GENERIC =================
    public void publish(AdminEvent event) {

        if (event.getCreatedAt() == null) {
            event.setCreatedAt(LocalDateTime.now());
        }

        log.info("[ADMIN EVENT] type={}, actor={}, entity={}, id={}",
                event.getType(),
                event.getActor(),
                event.getEntity(),
                event.getEntityId()
        );

        publisher.publishEvent(event);
    }

    // ================= QUICK HELPER =================
    public void publish(
            AdminEventType type,
            String actor,
            String entity,
            Long entityId,
            String description
    ) {
        AdminEvent event = AdminEvent.builder()
                .type(type)
                .actor(actor)
                .entity(entity)
                .entityId(entityId)
                .description(description)
                .createdAt(LocalDateTime.now())
                .build();

        publish(event);
    }

    // ================= WITH METADATA =================
    public void publishWithMetadata(
            AdminEventType type,
            String actor,
            String entity,
            Long entityId,
            String description,
            Map<String, Object> metadata
    ) {
        AdminEvent event = AdminEvent.builder()
                .type(type)
                .actor(actor)
                .entity(entity)
                .entityId(entityId)
                .description(description)
                .metadata(metadata)
                .createdAt(LocalDateTime.now())
                .build();

        publish(event);
    }
}