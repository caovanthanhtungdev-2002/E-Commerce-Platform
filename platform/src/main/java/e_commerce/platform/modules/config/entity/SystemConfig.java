package e_commerce.platform.modules.config.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "system_configs")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SystemConfig {

    @Id
    private String configKey;

    @Column(nullable = false)
    private String configValue;
}