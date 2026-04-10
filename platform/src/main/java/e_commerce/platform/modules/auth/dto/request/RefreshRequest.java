package e_commerce.platform.modules.auth.dto.request;

import lombok.Data;

@Data
public class RefreshRequest {
    private String refreshToken;
}