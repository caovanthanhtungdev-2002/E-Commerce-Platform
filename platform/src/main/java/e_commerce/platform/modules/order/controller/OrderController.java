package e_commerce.platform.modules.order.controller;

import e_commerce.platform.common.response.ApiResponse;
import e_commerce.platform.modules.order.dto.request.CreateOrderRequest;
import e_commerce.platform.modules.order.dto.response.OrderResponse;
import e_commerce.platform.modules.order.mapper.OrderMapper;
import e_commerce.platform.modules.order.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import e_commerce.platform.modules.order.entity.Order;

import java.util.List;

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
}