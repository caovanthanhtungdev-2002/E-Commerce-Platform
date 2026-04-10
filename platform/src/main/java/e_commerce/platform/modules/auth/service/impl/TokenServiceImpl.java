package e_commerce.platform.modules.auth.service.impl;

import e_commerce.platform.cache.redis.RedisKey;
import e_commerce.platform.cache.redis.RedisService;
import e_commerce.platform.exception.UnauthorizedException;
import e_commerce.platform.modules.auth.service.TokenService;
import e_commerce.platform.security.jwt.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TokenServiceImpl implements TokenService {

    private final RedisService redisService;
    private final JwtTokenProvider jwtTokenProvider;

    private static final long REFRESH_TOKEN_TTL = 7 * 24 * 60 * 60; // 7 ngày

    @Override
    public String generateAccessToken(String username, String role) {
        return jwtTokenProvider.generateToken(username, role);
    }

    @Override
    public String createRefreshToken(String username) {

        String token = UUID.randomUUID().toString();

        redisService.set(
                RedisKey.refreshToken(token),
                username,
                REFRESH_TOKEN_TTL
        );

        return token;
    }

    @Override
    public String verifyRefreshToken(String token) {

        Object username = redisService.get(
                RedisKey.refreshToken(token)
        );

        if (username == null) {
            throw new UnauthorizedException("Invalid refresh token");
        }

        return username.toString();
    }

    @Override
    public void revokeToken(String token) {

        redisService.delete(
                RedisKey.refreshToken(token)
        );
    }
}