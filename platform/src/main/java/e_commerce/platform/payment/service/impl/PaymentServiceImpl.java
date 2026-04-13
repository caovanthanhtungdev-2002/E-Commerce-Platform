package e_commerce.platform.payment.service.impl;

import e_commerce.platform.exception.ResourceNotFoundException;
import e_commerce.platform.modules.order.entity.Order;
import e_commerce.platform.modules.order.enums.OrderStatus;
import e_commerce.platform.modules.order.repository.OrderRepository;
import e_commerce.platform.modules.inventory.service.InventoryService;
import e_commerce.platform.payment.dto.response.CreatePaymentResponse;
import e_commerce.platform.payment.entity.Payment;
import e_commerce.platform.payment.enums.PaymentStatus;
import e_commerce.platform.payment.provider.PaymentProvider;
import e_commerce.platform.payment.repository.PaymentRepository;
import e_commerce.platform.payment.service.PaymentService;

import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class PaymentServiceImpl implements PaymentService {

    private final PaymentRepository paymentRepository;
    private final OrderRepository orderRepository;
    private final InventoryService inventoryService;
    private final PaymentProvider paymentProvider;

    // ================= CREATE =================
    @Override
    public CreatePaymentResponse createPayment(Long orderId) {

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        Payment payment = Payment.builder()
                .orderId(orderId)
                .amount(order.getTotalPrice())
                .status(PaymentStatus.PENDING)
                .provider("FAKE")
                .createdAt(LocalDateTime.now())
                .build();

        paymentRepository.save(payment);

        String url = paymentProvider.createPaymentUrl(payment.getId(), payment.getAmount());

        return CreatePaymentResponse.builder()
                .paymentUrl(url)
                .build();
    }

    // ================= CALLBACK =================
    @Override
    @Transactional
    public void handleCallback(String transactionId, boolean success) {

        Payment payment = paymentRepository.findById(Long.valueOf(transactionId))
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found"));

        // IDEMPOTENCY 
        if (payment.getStatus() == PaymentStatus.SUCCESS) return;

        Order order = orderRepository.findById(payment.getOrderId())
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        if (success) {

            payment.setStatus(PaymentStatus.SUCCESS);
            order.setStatus(OrderStatus.PAID);

        } else {

            payment.setStatus(PaymentStatus.FAILED);
            order.setStatus(OrderStatus.CANCELLED);

            //rollback inventory
            order.getItems().forEach(i ->
                    inventoryService.increaseStock(i.getProductId(), i.getQuantity())
            );
        }

        payment.setTransactionId(transactionId);

        paymentRepository.save(payment);
        orderRepository.save(order);
    }
}