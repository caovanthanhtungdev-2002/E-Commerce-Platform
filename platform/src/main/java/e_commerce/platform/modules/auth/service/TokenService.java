package e_commerce.platform.modules.auth.service;

import e_commerce.platform.modules.auth.entity.RefreshToken;

public interface TokenService {

    String generateAccessToken(String username, String role);

    RefreshToken createRefreshToken(String username);

    RefreshToken verifyRefreshToken(String token);

    void revokeToken(String token);
}