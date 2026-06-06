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
import e_commerce.platform.modules.order.service.OrderNotificationService;
import e_commerce.platform.modules.payment.dto.response.CreatePaymentResponse;
import e_commerce.platform.modules.payment.entity.Payment;
import e_commerce.platform.modules.payment.enums.PaymentMethod;
import e_commerce.platform.modules.payment.enums.PaymentStatus;
import e_commerce.platform.modules.payment.provider.impl.VNPayProvider;
import e_commerce.platform.modules.payment.repository.PaymentRepository;
import e_commerce.platform.modules.payment.service.PaymentService;
import e_commerce.platform.modules.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class PaymentServiceImpl implements PaymentService {

    private final PaymentRepository paymentRepository;
    private final OrderRepository orderRepository;
    private final InventoryService inventoryService;
    private final VNPayProvider vnPayProvider;
    private final OrderNotificationService orderNotificationService;
private final UserRepository userRepository; // để lấy username từ userId

    // ================= CREATE =================
    @Override
public CreatePaymentResponse createPayment(Long orderId) {

    Order order = orderRepository.findById(orderId)
    
            .orElseThrow(() -> new ResourceNotFoundException("Order not found: " + orderId));

            // Không tạo payment link cho COD
    if ("COD".equalsIgnoreCase(order.getPaymentMethod())) {
        throw new BadRequestException("Đơn COD không cần tạo link thanh toán");
    }

    if (order.getStatus() != OrderStatus.AWAITING_PAYMENT) {
    throw new BadRequestException("Order is not in AWAITING_PAYMENT state. Current: " + order.getStatus());
}

    // Lấy payment mới nhất
    Payment latestPayment = paymentRepository
            .findTopByOrderIdOrderByCreatedAtDesc(orderId);

    // reuse nếu đang PENDING
    if (latestPayment != null && latestPayment.getStatus() == PaymentStatus.PENDING) {
        log.info("[PAYMENT] Reusing existing PENDING payment id={} for orderId={}",
                latestPayment.getId(), orderId);

        String url = vnPayProvider.createPaymentUrl(
                latestPayment.getId(),
                orderId,
                latestPayment.getAmount()
        );

        return CreatePaymentResponse.builder()
                .paymentUrl(url)
                .build();
    }

    //tạo mới nếu không có hoặc đã FAILED
    Payment payment = Payment.builder()
            .orderId(orderId)
            .amount(order.getTotalPrice())
            .status(PaymentStatus.PENDING)
            .provider(PaymentMethod.VNPAY)
            .createdAt(LocalDateTime.now())
            .build();

    paymentRepository.save(payment);

    String url = vnPayProvider.createPaymentUrl(
            payment.getId(),
            orderId,
            payment.getAmount()
    );

    log.info("[PAYMENT] Created payment id={} for orderId={}", payment.getId(), orderId);

    return CreatePaymentResponse.builder()
            .paymentUrl(url)
            .build();
}

    // ================= CALLBACK VNPay =================
    /**
     * Xử lý callback từ VNPAY sau khi user thanh toán.
     *
     * Return value: orderId (String) để frontend navigate đúng trang,
     * hoặc "INVALID_SIGNATURE" / "INVALID_PARAMS" khi có lỗi.
     */
    @Override
    public String handleVNPayCallback(Map<String, String> params) {

        // 1. Xác minh chữ ký
        if (!vnPayProvider.verify(params)) {
            log.warn("[PAYMENT] VNPay callback invalid signature. Params={}", params);
            return "INVALID_SIGNATURE";
        }

        String txnRef       = params.get("vnp_TxnRef");       
        String responseCode = params.get("vnp_ResponseCode");
        String transactionId = params.get("vnp_TransactionNo"); 
        String orderInfo    = params.get("vnp_OrderInfo");      

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
            log.info("[PAYMENT] Callback ignored — payment id={} already processed with status={}",
                    payment.getId(), payment.getStatus());
            // Vẫn trả orderId để frontend navigate được
            return String.valueOf(payment.getOrderId());
        }

        Order order = orderRepository.findById(payment.getOrderId())
                .orElseThrow(() -> new ResourceNotFoundException("Order not found: " + payment.getOrderId()));

        if ("00".equals(responseCode)) {
    payment.setStatus(PaymentStatus.SUCCESS);
    payment.setTransactionId(transactionId);
    order.setStatus(OrderStatus.PAID);
    order.setPaidAt(LocalDateTime.now());

    order.getItems().forEach(item ->
        inventoryService.confirmOrder(item.getProduct().getId(), item.getQuantity())
    );

    log.info("[PAYMENT] SUCCESS: paymentId={}, orderId={}, transactionId={}",
        payment.getId(), order.getId(), transactionId);

    // Notify SUCCESS
    orderNotificationService.notifyPaymentResult(
        order.getUsername(), order.getId(), true, transactionId);
    orderNotificationService.notifyOrderUpdated(
        order.getUsername(), order.getId(), OrderStatus.PAID.name());

} else {
    payment.setStatus(PaymentStatus.FAILED);
    payment.setTransactionId(transactionId);
    
   
    order.setStatus(OrderStatus.AWAITING_PAYMENT);

    log.info("[PAYMENT] FAILED: paymentId={}, orderId={}, responseCode={}",
        payment.getId(), order.getId(), responseCode);

    orderNotificationService.notifyPaymentResult(
        order.getUsername(), order.getId(), false, transactionId);
}

paymentRepository.save(payment);
orderRepository.save(order);

return String.valueOf(order.getId());
    }
    // ================= COD =================
@Override
public void confirmCOD(Long orderId) {
    Order order = orderRepository.findById(orderId)
            .orElseThrow(() -> new ResourceNotFoundException("Order not found: " + orderId));

    // Chỉ xử lý đơn COD
    if (!"COD".equalsIgnoreCase(order.getPaymentMethod())) {
        throw new BadRequestException("Đơn hàng này không phải COD");
    }

    // Chỉ cho phép khi đang DELIVERED
    if (order.getStatus() != OrderStatus.DELIVERED) {
        throw new BadRequestException("Chỉ xác nhận COD khi đơn đang DELIVERED");
    }

    // Tạo Payment record cho COD
    Payment payment = Payment.builder()
            .orderId(orderId)
            .amount(order.getFinalPrice())
            .status(PaymentStatus.COD_COLLECTED)
            .provider(PaymentMethod.COD)
            .createdAt(LocalDateTime.now())
            .build();

    paymentRepository.save(payment);

    // Cập nhật Order
    order.setStatus(OrderStatus.COMPLETED);
    order.setPaidAt(LocalDateTime.now());
    orderRepository.save(order);

    log.info("[COD] Confirmed payment for orderId={}", orderId);
}

}