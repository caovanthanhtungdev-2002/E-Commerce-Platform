package e_commerce.platform.modules.auth.service;

import e_commerce.platform.modules.auth.dto.response.AuthResponse;
import e_commerce.platform.modules.auth.dto.response.UserResponse;
import e_commerce.platform.modules.auth.dto.request.LoginRequest;
import e_commerce.platform.modules.auth.dto.request.RegisterRequest;
import e_commerce.platform.modules.auth.dto.request.ResetPasswordRequest;

public interface AuthService {

    // đăng ký
    UserResponse register(RegisterRequest request);

    // đăng nhập
    AuthResponse login(LoginRequest request);

    // refresh token
    AuthResponse refresh(String refreshToken);

    // logout
    void logout(String refreshToken);

    // gửi OTP qua email
    void forgotPassword(String email);

    // xác nhận OTP + đổi password
    void resetPassword(ResetPasswordRequest request);
}