package e_commerce.platform.modules.order.controller;

import e_commerce.platform.common.response.ApiResponse;
import e_commerce.platform.modules.order.dto.response.OrderResponse;
import e_commerce.platform.modules.order.service.OrderService;

import lombok.RequiredArgsConstructor;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @PostMapping
    public ApiResponse<OrderResponse> create(Authentication authentication) {

        return new ApiResponse<>(
                true,
                "Created",
                orderService.createOrder(authentication.getName())
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
}