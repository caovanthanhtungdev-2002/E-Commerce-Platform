package e_commerce.platform.modules.payment.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import e_commerce.platform.modules.payment.entity.Payment;

import java.util.Optional;

public interface PaymentRepository extends JpaRepository<Payment, Long> {

    Optional<Payment> findByTransactionId(String transactionId);
}