package e_commerce.platform.cache.redis;

public interface RedisService {

    void set(String key, Object value, long ttl);

    Object get(String key);

    void delete(String key);
}