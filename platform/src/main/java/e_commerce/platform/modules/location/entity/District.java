package e_commerce.platform.modules.location.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "districts")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class District {

    @Id
    private String code;

    @Column(nullable = false)
    private String name;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "province_code", nullable = false)
    private Province province;
}