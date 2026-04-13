package e_commerce.platform.modules.cart.service;

import e_commerce.platform.modules.cart.dto.response.CartResponse;

public interface CartService {

    void addToCart(String username, Long productId, Integer quantity);

    void removeFromCart(String username, Long productId);

    CartResponse getCart(String username);

    void clearCart(String username);
}