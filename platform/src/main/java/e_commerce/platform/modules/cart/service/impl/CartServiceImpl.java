package e_commerce.platform.modules.cart.service.impl;

import e_commerce.platform.cache.redis.RedisKey;
import e_commerce.platform.cache.redis.RedisService;
import e_commerce.platform.modules.cart.dto.response.*;
import e_commerce.platform.modules.cart.model.CartItem;
import e_commerce.platform.modules.cart.service.CartService;
import e_commerce.platform.modules.inventory.service.InventoryService;
import e_commerce.platform.modules.product.entity.Product;
import e_commerce.platform.modules.product.repository.ProductRepository;

import java.util.stream.Collectors;

import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;

import java.util.*;

@Service
@RequiredArgsConstructor
public class CartServiceImpl implements CartService {

    private final RedisService redisService;
    private final InventoryService inventoryService;
    private final ProductRepository productRepository;

    private static final long CART_TTL = 60 * 60 * 24; // 1 ngày

    // ================= ADD =================
    @Override
    public void addToCart(String username, Long productId, Integer quantity) {

        String key = RedisKey.cart(username);

        //reserve stock
        inventoryService.reserveStock(productId, quantity);

        List<CartItem> cart = getCartInternal(username);

        Optional<CartItem> existing = cart.stream()
                .filter(i -> i.getProductId().equals(productId))
                .findFirst();

        if (existing.isPresent()) {
            existing.get().setQuantity(existing.get().getQuantity() + quantity);
        } else {
            cart.add(new CartItem(productId, quantity));
        }

        redisService.set(key, cart, CART_TTL);
    }

    // ================= REMOVE =================
    @Override
    public void removeFromCart(String username, Long productId) {

        String key = RedisKey.cart(username);

        List<CartItem> cart = getCartInternal(username);

        cart.removeIf(item -> {
            if (item.getProductId().equals(productId)) {
                inventoryService.releaseStock(productId, item.getQuantity());
                return true;
            }
            return false;
        });

        redisService.set(key, cart, CART_TTL);
    }

    // ================= GET =================
    @Override
    public CartResponse getCart(String username) {

        List<CartItem> cart = getCartInternal(username);

        if (cart.isEmpty()) {
            return CartResponse.builder()
                    .items(Collections.emptyList())
                    .totalPrice(0.0)
                    .build();
        }

        // tránh N+1 query
        List<Long> productIds = cart.stream()
                .map(CartItem::getProductId)
                .toList();

        Map<Long, Product> productMap = productRepository
                .findAllById(productIds)
                .stream()
                .collect(Collectors.toMap(Product::getId, p -> p));

        List<CartItemResponse> items = new ArrayList<>();

        for (CartItem item : cart) {

            Product product = productMap.get(item.getProductId());
            if (product == null) continue;

            items.add(
                    CartItemResponse.builder()
                            .productId(product.getId())
                            .productName(product.getName())
                            .price(product.getPrice())
                            .quantity(item.getQuantity())
                            .build()
            );
        }

        double total = items.stream()
                .mapToDouble(i -> i.getPrice() * i.getQuantity())
                .sum();

        return CartResponse.builder()
                .items(items)
                .totalPrice(total)
                .build();
    }

    // ================= CLEAR =================
    @Override
    public void clearCart(String username) {

        List<CartItem> cart = getCartInternal(username);

        for (CartItem item : cart) {
            inventoryService.releaseStock(item.getProductId(), item.getQuantity());
        }

        redisService.delete(RedisKey.cart(username));
    }

    // ================= INTERNAL =================
    private List<CartItem> getCartInternal(String username) {

        Object cached = redisService.get(RedisKey.cart(username));

        if (cached instanceof List<?>) {
            return (List<CartItem>) cached;
        }

        return new ArrayList<>();
    }
}