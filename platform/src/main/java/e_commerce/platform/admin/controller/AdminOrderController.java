package e_commerce.platform.admin.controller;

import e_commerce.platform.admin.dto.response.AdminOrderResponse;
import e_commerce.platform.admin.service.AdminOrderService;
import e_commerce.platform.common.response.ApiResponse;
import e_commerce.platform.modules.order.enums.OrderStatus;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/admin/orders")
@RequiredArgsConstructor
public class AdminOrderController {

    private final AdminOrderService orderService;

    // ================================
    // DANH SÁCH & LỌC
    // ================================

    @GetMapping
    public ResponseEntity<List<AdminOrderResponse>> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(orderService.getOrders(page, size));
    }

    @GetMapping("/{id}")
    public ResponseEntity<AdminOrderResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(orderService.getOrderById(id));
    }

    @GetMapping("/filter")
    public ResponseEntity<List<AdminOrderResponse>> filter(
            @RequestParam(required = false) OrderStatus status,
            @RequestParam(required = false) String username,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime from,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime to) {
        return ResponseEntity.ok(
                orderService.filterOrders(status, username, from, to));
    }

    // ================================
    // CẬP NHẬT TRẠNG THÁI THỦ CÔNG
    // ================================

    @PatchMapping("/{id}/status")
    public ResponseEntity<Void> updateStatus(
            @PathVariable Long id,
            @RequestParam OrderStatus status) {
        orderService.updateOrderStatus(id, status);
        return ResponseEntity.noContent().build();
    }

    // ================================
    // XÁC NHẬN ĐƠN (PENDING → CONFIRMED)
    // ================================

   @PatchMapping("/{id}/confirm")
public ResponseEntity<ApiResponse<Void>> confirm(@PathVariable Long id) {
    orderService.confirmOrder(id);  // ← thay updateOrderStatus bằng confirmOrder
    return ResponseEntity.ok(new ApiResponse<>(true, "Đơn hàng đã được xác nhận", null));
}

    // ================================
    // HUỶ ĐƠN
    // ================================

    @PatchMapping("/{id}/cancel")
    public ResponseEntity<ApiResponse<Void>> cancel(
            @PathVariable Long id,
            @RequestParam(required = false) String reason) {
        orderService.cancelOrder(id, reason);
        return ResponseEntity.ok(new ApiResponse<>(
                true,
                "Đơn hàng đã bị huỷ" + (reason != null ? ": " + reason : ""),
                null));
    }

    // ================================
    // HOÀN TẤT ĐƠN
    // ================================

    @PatchMapping("/{id}/complete")
    public ResponseEntity<ApiResponse<Void>> complete(@PathVariable Long id) {
        orderService.forceCompleteOrder(id);
        return ResponseEntity.ok(new ApiResponse<>(true, "Đơn hàng đã giao thành công", null));
    }

    // ================================
    // HOÀN TIỀN
    // ================================

    @PatchMapping("/{id}/refund")
    public ResponseEntity<Void> refund(@PathVariable Long id) {
        orderService.refundOrder(id);
        return ResponseEntity.noContent().build();
    }

    // ================================
    // XOÁ ĐƠN
    // ================================

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        orderService.deleteOrder(id);
        return ResponseEntity.noContent().build();
    }
    @PatchMapping("/{orderId}/process")
public ResponseEntity<Void> processOrder(@PathVariable Long orderId) {
    orderService.processOrder(orderId);
    return ResponseEntity.ok().build();
}



@PatchMapping("/{orderId}/deliver")
public ResponseEntity<Void> deliverOrder(@PathVariable Long orderId) {
    orderService.deliverOrder(orderId);
    return ResponseEntity.ok().build();
}


@PostMapping("/{id}/ship")
public ResponseEntity<?> ship(
    @PathVariable Long id,
    @RequestParam String carrier,
    @RequestParam String trackingNumber,
    @RequestParam(required = false) String note
) {
    orderService.shipOrder(id, carrier, trackingNumber, note);
    return ResponseEntity.ok().build();
}

}