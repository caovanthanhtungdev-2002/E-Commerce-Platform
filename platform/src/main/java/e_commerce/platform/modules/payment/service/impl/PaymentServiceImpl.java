package e_commerce.platform.modules.payment.service.impl;

import java.time.LocalDateTime;
import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import e_commerce.platform.exception.BadRequestException;
import e_commerce.platform.exception.ResourceNotFoundException;
import e_commerce.platform.modules.inventory.service.InventoryService;
import e_commerce.platform.modules.order.entity.Order;
import e_commerce.platform.modules.order.enums.OrderStatus;
import e_commerce.platform.modules.order.repository.OrderRepository;
import e_commerce.platform.modules.payment.dto.response.CreatePaymentResponse;
import e_commerce.platform.modules.payment.entity.Payment;
import e_commerce.platform.modules.payment.enums.PaymentStatus;
import e_commerce.platform.modules.payment.provider.PaymentProvider;
import e_commerce.platform.modules.payment.provider.impl.VNPayProvider;
import e_commerce.platform.modules.payment.repository.PaymentRepository;
import e_commerce.platform.modules.payment.service.PaymentService;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PaymentServiceImpl implements PaymentService {

    private final PaymentRepository paymentRepository;
    private final OrderRepository orderRepository;
    private final InventoryService inventoryService;
    private final VNPayProvider vnPayProvider;
    private final PaymentProvider paymentProvider;

    // ================= CREATE =================
    @Override
    public CreatePaymentResponse createPayment(Long orderId) {

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

                if (order.getStatus() != OrderStatus.PENDING) {
    throw new BadRequestException("Order already processed");
}

        Payment payment = Payment.builder()
                .orderId(orderId)
                .amount(order.getTotalPrice())
                .status(PaymentStatus.PENDING)
                .provider("VNPAY")
                .createdAt(LocalDateTime.now())
                .build();

        paymentRepository.save(payment);

        String url = paymentProvider.createPaymentUrl(payment.getId(), payment.getAmount());

        return CreatePaymentResponse.builder()
                .paymentUrl(url)
                .build();
    }

    // ================= CALLBACK VNPay =================
    @Override
    @Transactional
    public String handleVNPayCallback(Map<String, String> params) {

        boolean valid = vnPayProvider.verify(params);

        if (!valid) {
            return "INVALID SIGNATURE";
        }

        String txnRef = params.get("vnp_TxnRef");
        String responseCode = params.get("vnp_ResponseCode");

        Payment payment = paymentRepository.findById(Long.valueOf(txnRef))
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found"));

        // IDEMPOTENCY (tránh xử lý lại)
        if (payment.getStatus() != PaymentStatus.PENDING) {
            return "IGNORED";
}

        Order order = orderRepository.findById(payment.getOrderId())
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        if ("00".equals(responseCode)) {

            payment.setStatus(PaymentStatus.SUCCESS);
            order.setStatus(OrderStatus.PAID);

            // CONFIRM INVENTORY
            order.getItems().forEach(i ->
                    inventoryService.confirmOrder(i.getProduct().getId(), i.getQuantity())
            );

        } else {

            payment.setStatus(PaymentStatus.FAILED);
            order.setStatus(OrderStatus.CANCELLED);

            // RELEASE INVENTORY
            order.getItems().forEach(i ->
                    inventoryService.releaseStock(i.getProduct().getId(), i.getQuantity())
            );
        }

        payment.setTransactionId(txnRef);

        paymentRepository.save(payment);
        orderRepository.save(order);

        return "SUCCESS";
    }
}