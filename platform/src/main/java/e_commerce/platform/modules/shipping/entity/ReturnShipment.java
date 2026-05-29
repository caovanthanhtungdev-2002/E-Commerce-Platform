package e_commerce.platform.modules.shipping.entity;


import e_commerce.platform.modules.shipping.enums.ReturnStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "return_shipments")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ReturnShipment {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false)
    private String orderId;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String reason;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ReturnStatus status;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal refundAmount;

    private String carrier;
    private String trackingNumber;

    @Column(columnDefinition = "TEXT")
    private String note;

    @OneToMany(mappedBy = "returnShipment", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<ReturnItem> returnItems = new ArrayList<>();

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}