package e_commerce.platform.modules.auth.service;

public interface TokenService {

    String generateAccessToken(String username, String role);

   String createRefreshToken(String username);

    String verifyRefreshToken(String token);

    void revokeToken(String token);
}