package e_commerce.platform.security.handler;
import com.fasterxml.jackson.databind.ObjectMapper;
import e_commerce.platform.common.response.ApiResponse;
import jakarta.servlet.http.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class CustomAccessDeniedHandler implements AccessDeniedHandler {

    private final ObjectMapper objectMapper;

    @Override
    public void handle(
            HttpServletRequest request,
            HttpServletResponse response,
            AccessDeniedException ex
    ) throws IOException {

        response.setContentType("application/json");
        response.setStatus(HttpServletResponse.SC_FORBIDDEN);

        ApiResponse<?> body = new ApiResponse<>(
                false,
                "Access denied",
                null
        );

        response.getWriter().write(objectMapper.writeValueAsString(body));
    }
}