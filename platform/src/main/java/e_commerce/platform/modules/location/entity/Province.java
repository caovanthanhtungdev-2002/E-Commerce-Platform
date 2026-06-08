package e_commerce.platform.modules.location.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "provinces")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Province {

    @Id
    private String code;        // "01", "48"...

    @Column(nullable = false)
    private String name;        // "Hà Nội", "Đà Nẵng"

    private String region;      // "NORTH", "CENTRAL", "SOUTH"
}