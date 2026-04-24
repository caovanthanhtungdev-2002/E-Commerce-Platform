package e_commerce.platform.admin.service.impl;

import e_commerce.platform.admin.service.AdminOrderService;

import e_commerce.platform.modules.order.entity.Order;
import e_commerce.platform.modules.order.enums.OrderStatus;
import e_commerce.platform.modules.order.repository.OrderRepository;

import e_commerce.platform.exception.ResourceNotFoundException;
import e_commerce.platform.exception.BadRequestException;

import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class AdminOrderServiceImpl implements AdminOrderService {

    private final OrderRepository orderRepository;

    // ================= GET ALL (phân trang) =================
    @Override
    public List<Order> getOrders(int page, int size) {
        Pageable pageable = PageRequest.of(
                page, size,
                Sort.by("createdAt").descending()   // mới nhất lên đầu
        );
        return orderRepository.findAll(pageable).getContent();
    }

    // ================= GET BY ID =================
    @Override
    public Order getOrderById(Long orderId) {
        return orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Order not found with id: " + orderId));
    }

    // ================= FILTER =================
    @Override
    public List<Order> filterOrders(OrderStatus status, String username,
                                    LocalDateTime from, LocalDateTime to) {
        // validate date range
        if (from != null && to != null && from.isAfter(to)) {
            throw new BadRequestException("'from' date must be before 'to' date");
        }
        return orderRepository.filterOrders(status, username, from, to);
    }

    // ================= UPDATE STATUS =================
    @Override
    public void updateOrderStatus(Long orderId, OrderStatus newStatus) {

        Order order = getOrderById(orderId);

        validateStatusTransition(order.getStatus(), newStatus);

        order.setStatus(newStatus);
    }

    // ================= CANCEL =================
    @Override
    public void cancelOrder(Long orderId, String reason) {

        Order order = getOrderById(orderId);

        // chỉ PENDING mới được cancel
        if (order.getStatus() != OrderStatus.PENDING) {
            throw new BadRequestException(
                    "Only PENDING orders can be cancelled. Current status: "
                    + order.getStatus());
        }

        order.setStatus(OrderStatus.CANCELLED);

        // TODO: gửi email thông báo lý do cancel cho user nếu cần
        // notificationService.sendCancelEmail(order.getUsername(), reason);
    }

    // ================= REFUND =================
    @Override
    public void refundOrder(Long orderId) {

        Order order = getOrderById(orderId);

        // chỉ PAID mới được refund
        if (order.getStatus() != OrderStatus.PAID) {
            throw new BadRequestException(
                    "Only PAID orders can be refunded. Current status: "
                    + order.getStatus());
        }

        order.setStatus(OrderStatus.REFUNDED);

        // TODO: tích hợp payment gateway để hoàn tiền thực tế
        // paymentService.refund(order.getId(), order.getFinalPrice());
    }

    // ================= FORCE COMPLETE =================
    @Override
    public void forceCompleteOrder(Long orderId) {

        Order order = getOrderById(orderId);

        // chỉ PAID mới được force complete
        if (order.getStatus() != OrderStatus.PAID) {
            throw new BadRequestException(
                    "Only PAID orders can be completed. Current status: "
                    + order.getStatus());
        }

        order.setStatus(OrderStatus.COMPLETED);
    }

    // ================= DELETE =================
    @Override
    public void deleteOrder(Long orderId) {

        Order order = getOrderById(orderId);

        // chỉ cho phép xóa order CANCELLED hoặc REFUNDED
        // tránh xóa nhầm order đang xử lý
        if (order.getStatus() != OrderStatus.CANCELLED
                && order.getStatus() != OrderStatus.REFUNDED) {
            throw new BadRequestException(
                    "Only CANCELLED or REFUNDED orders can be deleted. Current status: "
                    + order.getStatus());
        }

        orderRepository.deleteById(orderId);
    }

    // ================= PRIVATE: validate chuyển trạng thái =================
    private void validateStatusTransition(OrderStatus current, OrderStatus next) {

        // định nghĩa luồng hợp lệ
        boolean valid = switch (current) {
            case PENDING   -> next == OrderStatus.PAID
                           || next == OrderStatus.CANCELLED;

            case PAID      -> next == OrderStatus.COMPLETED
                           || next == OrderStatus.REFUNDED;

            // trạng thái cuối — không chuyển tiếp được
            case CANCELLED,
                 REFUNDED,
                 COMPLETED -> false;
        };

        if (!valid) {
            throw new BadRequestException(
                    "Invalid status transition: " + current + " → " + next);
        }
    }
}