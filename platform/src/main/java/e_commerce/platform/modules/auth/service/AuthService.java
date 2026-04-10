package e_commerce.platform.modules.auth.service;

import e_commerce.platform.modules.auth.dto.response.AuthResponse;
import e_commerce.platform.modules.auth.dto.response.UserResponse;
import e_commerce.platform.modules.auth.dto.request.LoginRequest;
import e_commerce.platform.modules.auth.dto.request.RegisterRequest;

public interface AuthService {

    UserResponse register(RegisterRequest request);

    AuthResponse login(LoginRequest request);

    AuthResponse refresh(String refreshToken);

    void logout(String refreshToken);
}