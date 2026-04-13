package e_commerce.platform.cache.redis;

public class RedisKey {

    // AUTH
    public static String refreshToken(String token) {
        return "ecommerce:auth:refresh:" + token;
    }

    public static String blacklistToken(String token) {
        return "ecommerce:auth:blacklist:" + token;
    }

    // PRODUCT
    public static String product(Long id) {
        return "ecommerce:product:" + id;
    }

    public static String productList(int page, int size) {
        return "ecommerce:product:list:" + page + ":" + size;
    }

    public static String productList() {
        return "ecommerce:product:list";
    }

    // CATEGORY
    public static String categoryList() {
        return "ecommerce:category:list";
    }

    // CART
    public static String cart(String username) {
        return "ecommerce:cart:" + username;
    }
}
