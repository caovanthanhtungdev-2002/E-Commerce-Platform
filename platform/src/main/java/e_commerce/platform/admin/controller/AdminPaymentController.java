package e_commerce.platform.admin.controller;

import e_commerce.platform.admin.service.AdminPaymentService;
import e_commerce.platform.modules.payment.entity.Payment;
import e_commerce.platform.modules.payment.enums.PaymentStatus;

import lombok.RequiredArgsConstructor;

import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/payments")
@RequiredArgsConstructor
public class AdminPaymentController {

    private final AdminPaymentService paymentService;

    @GetMapping
    public List<Payment> getAll(@RequestParam int page,
                               @RequestParam int size) {
        return paymentService.getPayments(page, size);
    }

    @GetMapping("/{id}")
    public Payment getById(@PathVariable Long id) {
        return paymentService.getPaymentById(id);
    }

    @GetMapping("/status")
    public List<Payment> byStatus(@RequestParam PaymentStatus status) {
        return paymentService.getPaymentsByStatus(status);
    }

    @PatchMapping("/{id}/refund")
    public void refund(@PathVariable Long id) {
        paymentService.refundPayment(id);
    }

    @PatchMapping("/{id}/fail")
    public void fail(@PathVariable Long id) {
        paymentService.markPaymentFailed(id);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        paymentService.deletePayment(id);
    }
}