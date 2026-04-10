package e_commerce.platform.modules.test.controller;


import e_commerce.platform.cache.redis.RedisService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/test/redis")
@RequiredArgsConstructor
public class RedisTestController {

    private final RedisService redisService;

    @GetMapping("/set")
    public String set() {
        redisService.set("test:key", "hello redis", 60);
        return "SET OK";
    }

    @GetMapping("/get")
    public Object get() {
        return redisService.get("test:key");
    }

    @GetMapping("/delete")
    public String delete() {
        redisService.delete("test:key");
        return "DELETED";
    }
}
