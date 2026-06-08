package e_commerce.platform.modules.shipping.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "shipping_fee_config")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ShippingFeeConfig {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String region;   // "NORTH", "CENTRAL", "SOUTH"

    @Column(nullable = false)
    private Double fee;

   
}