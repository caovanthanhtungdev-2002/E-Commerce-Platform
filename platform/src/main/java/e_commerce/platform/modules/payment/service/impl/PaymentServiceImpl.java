package e_commerce.platform.modules.payment.service.impl;

import java.time.LocalDateTime;
import java.util.Map;

import lombok.extern.slf4j.Slf4j;
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
import e_commerce.platform.modules.payment.provider.impl.VNPayProvider;
import e_commerce.platform.modules.payment.repository.PaymentRepository;
import e_commerce.platform.modules.payment.service.PaymentService;
import lombok.RequiredArgsConstructor;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class PaymentServiceImpl implements PaymentService {

    private final PaymentRepository paymentRepository;
    private final OrderRepository orderRepository;
    private final InventoryService inventoryService;

    // Chỉ inject VNPayProvider — bỏ PaymentProvider interface vì đang dùng trực tiếp VNPay
    private final VNPayProvider vnPayProvider;

    // ================= CREATE =================
    @Override
    public CreatePaymentResponse createPayment(Long orderId) {

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found: " + orderId));

        if (order.getStatus() != OrderStatus.PENDING) {
            throw new BadRequestException("Order is not in PENDING state. Current: " + order.getStatus());
        }

        // Idempotency: nếu đã có payment PENDING cho order này thì trả lại URL cũ
        // (tránh tạo duplicate payment khi user bấm lại)
        return paymentRepository.findByOrderId(orderId)
                .filter(p -> p.getStatus() == PaymentStatus.PENDING)
                .map(existing -> {
                    log.info("[PAYMENT] Reusing existing PENDING payment id={} for orderId={}", existing.getId(), orderId);
                    String url = vnPayProvider.createPaymentUrl(existing.getId(), existing.getAmount());
                    return CreatePaymentResponse.builder().paymentUrl(url).build();
                })
                .orElseGet(() -> {
                    Payment payment = Payment.builder()
                            .orderId(orderId)
                            .amount(order.getTotalPrice())
                            .status(PaymentStatus.PENDING)
                            .provider("VNPAY")
                            .createdAt(LocalDateTime.now())
                            .build();

                    paymentRepository.save(payment);

                    String url = vnPayProvider.createPaymentUrl(payment.getId(), payment.getAmount());
                    log.info("[PAYMENT] Created payment id={} for orderId={}", payment.getId(), orderId);

                    return CreatePaymentResponse.builder().paymentUrl(url).build();
                });
    }

    // ================= CALLBACK VNPay =================
    @Override
    public String handleVNPayCallback(Map<String, String> params) {

        // 1. Xác minh chữ ký
        if (!vnPayProvider.verify(params)) {
            log.warn("[PAYMENT] VNPay callback invalid signature. Params={}", params);
            return "INVALID_SIGNATURE";
        }

        String txnRef = params.get("vnp_TxnRef");
        String responseCode = params.get("vnp_ResponseCode");
        String transactionId = params.get("vnp_TransactionNo"); // ID thật của VNPay

        if (txnRef == null || responseCode == null) {
            log.warn("[PAYMENT] VNPay callback missing required params");
            return "INVALID_PARAMS";
        }

        Payment payment;
        try {
            payment = paymentRepository.findById(Long.valueOf(txnRef))
                    .orElseThrow(() -> new ResourceNotFoundException("Payment not found: " + txnRef));
        } catch (NumberFormatException e) {
            log.error("[PAYMENT] Invalid txnRef format: {}", txnRef);
            return "INVALID_PARAMS";
        }

        // 2. Idempotency — tránh xử lý lại callback bị gửi 2 lần
        if (payment.getStatus() != PaymentStatus.PENDING) {
            log.info("[PAYMENT] Callback ignored — payment id={} already processed with status={}", payment.getId(), payment.getStatus());
            return "ALREADY_PROCESSED";
        }

        Order order = orderRepository.findById(payment.getOrderId())
                .orElseThrow(() -> new ResourceNotFoundException("Order not found: " + payment.getOrderId()));

        if ("00".equals(responseCode)) {
            // ===== THANH TOÁN THÀNH CÔNG =====
            payment.setStatus(PaymentStatus.SUCCESS);
            payment.setTransactionId(transactionId); // lưu ID của VNPay
            order.setStatus(OrderStatus.PAID);

            // Confirm inventory (trừ stock thật sự)
            order.getItems().forEach(item ->
                    inventoryService.confirmOrder(item.getProduct().getId(), item.getQuantity())
            );

            log.info("[PAYMENT] SUCCESS: paymentId={}, orderId={}, transactionId={}", payment.getId(), order.getId(), transactionId);

        } else {
            // ===== THANH TOÁN THẤT BẠI =====
            payment.setStatus(PaymentStatus.FAILED);
            payment.setTransactionId(transactionId);
            order.setStatus(OrderStatus.CANCELLED);

            // Release inventory (hoàn lại stock đã reserve)
            order.getItems().forEach(item ->
                    inventoryService.releaseStock(item.getProduct().getId(), item.getQuantity())
            );

            log.info("[PAYMENT] FAILED: paymentId={}, orderId={}, responseCode={}", payment.getId(), order.getId(), responseCode);
        }

        paymentRepository.save(payment);
        orderRepository.save(order);

        return "SUCCESS";
    }
}