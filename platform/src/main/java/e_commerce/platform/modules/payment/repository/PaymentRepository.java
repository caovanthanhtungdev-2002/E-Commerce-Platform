package e_commerce.platform.modules.payment.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import e_commerce.platform.modules.payment.entity.Payment;
import e_commerce.platform.modules.payment.enums.PaymentStatus;

import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface PaymentRepository extends JpaRepository<Payment, Long> {

    Optional<Payment> findByTransactionId(String transactionId);

    Page<Payment> findAll(Pageable pageable);

    List<Payment> findByStatus(PaymentStatus status);

    Payment findTopByOrderIdOrderByCreatedAtDesc(Long orderId);

}