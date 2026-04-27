package e_commerce.platform.admin.event;

import lombok.*;

import java.time.LocalDateTime;
import java.util.Map;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminEvent {

    private AdminEventType type;

    private String actor; // admin username

    private String entity; // PRODUCT / ORDER / USER...

    private Long entityId;

    private String description;

    private Map<String, Object> metadata;

    private LocalDateTime createdAt;
}