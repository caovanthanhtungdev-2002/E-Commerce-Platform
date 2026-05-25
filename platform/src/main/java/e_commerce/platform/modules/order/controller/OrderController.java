package e_commerce.platform.modules.order.controller;

import java.util.List;
import java.util.Map;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import e_commerce.platform.common.response.ApiResponse;
import e_commerce.platform.modules.order.dto.request.CreateOrderRequest;
import e_commerce.platform.modules.order.dto.response.OrderResponse;
import e_commerce.platform.modules.order.entity.Order;
import e_commerce.platform.modules.order.mapper.OrderMapper;
import e_commerce.platform.modules.order.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;


    @PostMapping
public ApiResponse<OrderResponse> create(
        Authentication authentication,
        @Valid @RequestBody CreateOrderRequest request
) {

        return new ApiResponse<>(
                true,
                "Created",
                orderService.createOrder(authentication.getName(), request)
        );
    }

    @GetMapping("/{id}")
    public ApiResponse<OrderResponse> get(@PathVariable Long id) {

        return new ApiResponse<>(
                true,
                "Success",
                orderService.getOrder(id)
        );
    }

    @GetMapping
public ApiResponse<List<OrderResponse>> getMyOrders(Authentication auth) {

    List<Order> orders = orderService.getOrdersByUser(auth.getName());

    List<OrderResponse> responses = orders.stream()
            .map(OrderMapper::toResponse)
            .toList();

    return new ApiResponse<>(
            true,
            "Success",
            responses
    );
}
 // ── Khách xác nhận nhận hàng hoặc yêu cầu trả hàng ──
    @PatchMapping("/{id}/status")
    public ApiResponse<OrderResponse> updateStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body,
            Authentication auth
    ) {
        String status = body.get("status");
        return new ApiResponse<>(
                true,
                "Updated",
                orderService.updateStatusByCustomer(id, auth.getName(), status)
        );
    }
}