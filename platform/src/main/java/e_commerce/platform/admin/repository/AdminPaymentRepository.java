package e_commerce.platform.admin.repository;

import e_commerce.platform.modules.payment.entity.Payment;
import e_commerce.platform.modules.payment.enums.PaymentStatus;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface AdminPaymentRepository extends JpaRepository<Payment, Long> {

    List<Payment> findByStatus(PaymentStatus status);

    Optional<Payment> findByTransactionId(String transactionId);

    @Query("SELECT COUNT(p) FROM Payment p WHERE p.status = 'SUCCESS'")
    long countSuccessPayments();

    @Query("SELECT SUM(p.amount) FROM Payment p WHERE p.status = 'SUCCESS'")
    Double totalPaidAmount();
}