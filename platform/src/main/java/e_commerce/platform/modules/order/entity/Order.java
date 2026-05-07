package e_commerce.platform.modules.order.entity;

import jakarta.persistence.*;
import lombok.*;
import e_commerce.platform.modules.order.enums.OrderStatus;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(
    name = "orders",
    indexes = {
        @Index(name = "idx_coupon_code", columnList = "couponCode"),
        @Index(name = "idx_username", columnList = "username")
    }
)
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long userId;

    private String username;

    private Double totalPrice;

    @Enumerated(EnumType.STRING)
    private OrderStatus status;

    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<OrderItem> items;

    // Coupon fields
    private Double discount;

    private Double finalPrice;

    private String couponCode;

    private String receiverName;
    
    private String address;

    private String phone;

    private LocalDateTime updatedAt;

@PrePersist
public void prePersist() {
    this.createdAt = LocalDateTime.now();
}

@PreUpdate
public void preUpdate() {
    this.updatedAt = LocalDateTime.now();
}
}