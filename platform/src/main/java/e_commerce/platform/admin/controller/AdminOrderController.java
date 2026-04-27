package e_commerce.platform.admin.controller;

import e_commerce.platform.admin.service.AdminOrderService;
import e_commerce.platform.modules.order.entity.Order;
import e_commerce.platform.modules.order.enums.OrderStatus;

import lombok.RequiredArgsConstructor;

import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/admin/orders")
@RequiredArgsConstructor
public class AdminOrderController {

    private final AdminOrderService orderService;

    @GetMapping
    public List<Order> getAll(@RequestParam int page,
                             @RequestParam int size) {
        return orderService.getOrders(page, size);
    }

    @GetMapping("/{id}")
    public Order getById(@PathVariable Long id) {
        return orderService.getOrderById(id);
    }

    @GetMapping("/filter")
    public List<Order> filter(
            @RequestParam(required = false) OrderStatus status,
            @RequestParam(required = false) String username,
            @RequestParam(required = false) LocalDateTime from,
            @RequestParam(required = false) LocalDateTime to) {

        return orderService.filterOrders(status, username, from, to);
    }

    @PatchMapping("/{id}/status")
    public void updateStatus(@PathVariable Long id,
                             @RequestParam OrderStatus status) {
        orderService.updateOrderStatus(id, status);
    }

    @PatchMapping("/{id}/cancel")
    public void cancel(@PathVariable Long id,
                       @RequestParam String reason) {
        orderService.cancelOrder(id, reason);
    }

    @PatchMapping("/{id}/refund")
    public void refund(@PathVariable Long id) {
        orderService.refundOrder(id);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        orderService.deleteOrder(id);
    }
}