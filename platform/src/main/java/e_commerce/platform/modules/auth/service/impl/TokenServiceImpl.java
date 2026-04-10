package e_commerce.platform.modules.auth.service.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

import e_commerce.platform.exception.BadRequestException;
import e_commerce.platform.exception.UnauthorizedException;
import e_commerce.platform.modules.auth.entity.RefreshToken;
import e_commerce.platform.modules.auth.repository.RefreshTokenRepository;
import e_commerce.platform.modules.auth.service.TokenService;
import e_commerce.platform.security.jwt.JwtTokenProvider;

@Service
@RequiredArgsConstructor
@Slf4j
public class TokenServiceImpl implements TokenService {

    private final RefreshTokenRepository refreshTokenRepository;
    private final JwtTokenProvider jwtTokenProvider;

    @Override
    public String generateAccessToken(String username, String role) {
        return jwtTokenProvider.generateToken(username, role);
    }

    @Override
    public RefreshToken createRefreshToken(String username) {

        RefreshToken token = RefreshToken.builder()
                .token(UUID.randomUUID().toString())
                .username(username)
                .expiryDate(LocalDateTime.now().plusDays(7))
                .revoked(false)
                .build();

        return refreshTokenRepository.save(token);
    }

    @Override
    public RefreshToken verifyRefreshToken(String token) {

        RefreshToken rt = refreshTokenRepository.findByToken(token)
                .orElseThrow(() -> new UnauthorizedException("Invalid refresh token"));

        if (rt.isRevoked()) {
            throw new UnauthorizedException("Token revoked");
        }

        if (rt.getExpiryDate().isBefore(LocalDateTime.now())) {
            throw new UnauthorizedException("Token expired");
        }

        return rt;
    }

    @Override
    public void revokeToken(String token) {

        RefreshToken rt = refreshTokenRepository.findByToken(token)
                .orElseThrow(() -> new BadRequestException("Token not found"));

        rt.setRevoked(true);
        refreshTokenRepository.save(rt);
    }
}