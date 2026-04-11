package e_commerce.platform.security.handler;
// Khi chưa login / token sai
import com.fasterxml.jackson.databind.ObjectMapper;
import e_commerce.platform.common.response.ApiResponse;
import jakarta.servlet.http.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class CustomAuthenticationEntryPoint implements AuthenticationEntryPoint {

    private final ObjectMapper objectMapper;

    @Override
    public void commence(
            HttpServletRequest request,
            HttpServletResponse response,
            AuthenticationException ex
    ) throws IOException {

        response.setContentType("application/json");
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);

        ApiResponse<?> body = new ApiResponse<>(
                false,
                "Unauthorized - Please login",
                null
        );

        response.getWriter().write(objectMapper.writeValueAsString(body));
    }
}