package e_commerce.platform.modules.payment.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

import e_commerce.platform.modules.payment.enums.PaymentMethod;
import e_commerce.platform.modules.payment.enums.PaymentStatus;



@Entity
@Table(name = "payments")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long orderId;

    @Column(unique = true)
    private String transactionId;

    private Double amount;

    @Enumerated(EnumType.STRING)
    private PaymentStatus status;

    @Enumerated(EnumType.STRING)
    private PaymentMethod provider;

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}