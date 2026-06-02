package e_commerce.platform.modules.auth.oauth2;

import e_commerce.platform.modules.auth.service.TokenService;
import e_commerce.platform.modules.user.entity.User;
import e_commerce.platform.modules.user.repository.UserRepository;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;

@Component
@RequiredArgsConstructor
@Slf4j
public class OAuth2AuthenticationSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final TokenService tokenService;
    private final UserRepository userRepository;

    @Value("${app.oauth2.redirect-success}")
    private String redirectSuccessUrl;

    // Thời gian sống của refresh token cookie (7 ngày)
    private static final int REFRESH_TOKEN_COOKIE_MAX_AGE = 7 * 24 * 60 * 60;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication) throws IOException {

        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();

        // Lấy username đã gắn trong CustomOAuth2UserService
        String username = (String) oAuth2User.getAttributes().get("app_username");

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));

        String accessToken  = tokenService.generateAccessToken(username, user.getRole().name());
        String refreshToken = tokenService.createRefreshToken(username);

        //Refresh token lưu trong HttpOnly Cookie — không lộ qua URL/browser history
        Cookie refreshTokenCookie = new Cookie("refreshToken", refreshToken);
        refreshTokenCookie.setHttpOnly(true);   // JS không đọc được
        refreshTokenCookie.setSecure(true);     // Chỉ gửi qua HTTPS
        refreshTokenCookie.setPath("/");        // Áp dụng toàn bộ domain
        refreshTokenCookie.setMaxAge(REFRESH_TOKEN_COOKIE_MAX_AGE);
        // Nếu dùng Spring Boot 3+ / Servlet 6+, thêm SameSite=Lax để chống CSRF
        response.setHeader("Set-Cookie",
                String.format("refreshToken=%s; Max-Age=%d; Path=/; HttpOnly; Secure; SameSite=Lax",
                        refreshToken, REFRESH_TOKEN_COOKIE_MAX_AGE));

        //Chỉ đưa accessToken lên URL — ngắn hạn, ít rủi ro hơn
        String targetUrl = UriComponentsBuilder.fromUriString(redirectSuccessUrl)
                .queryParam("token", accessToken)
                .build().toUriString();

        log.info("OAuth2 login success: {} via {}", username, user.getProvider());

        getRedirectStrategy().sendRedirect(request, response, targetUrl);
    }
}