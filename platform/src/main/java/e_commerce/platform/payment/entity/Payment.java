package e_commerce.platform.payment.entity;

import e_commerce.platform.payment.enums.PaymentStatus;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;



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

    private String transactionId; // từ gateway

    private Double amount;

    @Enumerated(EnumType.STRING)
    private PaymentStatus status;

    private String provider; // VNPay, Stripe

    private LocalDateTime createdAt;
}