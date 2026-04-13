package e_commerce.platform.modules.cart.controller;

import e_commerce.platform.common.response.ApiResponse;
import e_commerce.platform.modules.cart.dto.request.AddToCartRequest;
import e_commerce.platform.modules.cart.dto.response.CartResponse;
import e_commerce.platform.modules.cart.service.CartService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;

    @PostMapping("/add")
    public ApiResponse<Void> add(
            @Valid @RequestBody AddToCartRequest request,
            Authentication authentication
    ) {
        cartService.addToCart(
                authentication.getName(),
                request.getProductId(),
                request.getQuantity()
        );

        return new ApiResponse<>(true, "Added", null);
    }

    @DeleteMapping("/remove/{productId}")
    public ApiResponse<Void> remove(
            @PathVariable Long productId,
            Authentication authentication
    ) {
        cartService.removeFromCart(authentication.getName(), productId);

        return new ApiResponse<>(true, "Removed", null);
    }

    @GetMapping
    public ApiResponse<CartResponse> get(Authentication authentication) {
        return new ApiResponse<>(
                true,
                "Success",
                cartService.getCart(authentication.getName())
        );
    }

    @DeleteMapping("/clear")
    public ApiResponse<Void> clear(Authentication authentication) {

        cartService.clearCart(authentication.getName());

        return new ApiResponse<>(true, "Cleared", null);
    }
}