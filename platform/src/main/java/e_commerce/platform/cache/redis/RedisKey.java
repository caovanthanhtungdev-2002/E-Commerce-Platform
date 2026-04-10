package e_commerce.platform.cache.redis;

public class RedisKey {

    public static String refreshToken(String token) {
        return "auth:refresh:" + token;
    }

    public static String blacklistToken(String token) {
        return "auth:blacklist:" + token;
    }
}