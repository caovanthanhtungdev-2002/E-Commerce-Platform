package e_commerce.platform.modules.auth.service.impl;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import e_commerce.platform.exception.BadRequestException;
import e_commerce.platform.exception.ConflictException;
import e_commerce.platform.exception.ResourceNotFoundException;
import e_commerce.platform.exception.UnauthorizedException;
import e_commerce.platform.integration.email.EmailService;
import e_commerce.platform.modules.audit.service.AuditService;
import e_commerce.platform.modules.auth.dto.request.LoginRequest;
import e_commerce.platform.modules.auth.dto.request.RegisterRequest;
import e_commerce.platform.modules.auth.dto.request.ResetPasswordRequest;
import e_commerce.platform.modules.auth.dto.response.AuthResponse;
import e_commerce.platform.modules.auth.dto.response.UserResponse;
import e_commerce.platform.modules.auth.enums.Role;
import e_commerce.platform.modules.auth.mapper.AuthMapper;
import e_commerce.platform.modules.auth.service.AuthService;
import e_commerce.platform.modules.auth.service.OtpStore;
import e_commerce.platform.modules.auth.service.TokenService;
import e_commerce.platform.modules.user.entity.User;
import e_commerce.platform.modules.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final TokenService tokenService;
    private final AuditService auditService;
    private final EmailService emailService;
    private final OtpStore otpStore;

    // ================= REGISTER =================
    @Override
public UserResponse register(RegisterRequest request) {

    log.info("Register user: {}", request.getUsername());

    //VALIDATE PASSWORD
    if (request.getPassword() == null || request.getConfirmPassword() == null) {
        throw new BadRequestException("Password không được để trống");
    }

    if (!request.getPassword().equals(request.getConfirmPassword())) {
        throw new BadRequestException("Password không khớp");
    }

    //CHECK EXIST
    if (userRepository.existsByUsername(request.getUsername())) {
        throw new ConflictException("Username already exists");
    }

    if (userRepository.existsByEmail(request.getEmail())) {
        throw new ConflictException("Email already exists");
    }

    if (userRepository.existsByPhone(request.getPhone())) {
        throw new ConflictException("Phone already exists");
    }

    //CREATE USER
    User user = User.builder()
            .username(request.getUsername())
            .email(request.getEmail())
            .password(passwordEncoder.encode(request.getPassword()))
            .phone(request.getPhone())
            .fullName(request.getFullName())
            .role(Role.USER)
            .build();

    userRepository.save(user);

    // AUDIT
    auditService.log(user.getUsername(), "REGISTER", "User registered");

    return AuthMapper.toUserResponse(user);
}

    // ================= LOGIN =================
    @Override
    public AuthResponse login(LoginRequest request) {

        User user = userRepository.findByEmail(request.getEmail())
        .orElseThrow(() -> new UnauthorizedException("Invalid credentials"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new UnauthorizedException("Invalid credentials");
        }

        String accessToken = tokenService.generateAccessToken(
                user.getUsername(),
                user.getRole().name()
        );

        String refreshToken = tokenService.createRefreshToken(user.getUsername());

        //AUDIT
        auditService.log(user.getUsername(), "LOGIN", "User logged in");

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .role(user.getRole().name())
                .user(AuthMapper.toUserResponse(user))
                .build();
    }

    // ================= REFRESH =================
    @Override
    public AuthResponse refresh(String refreshToken) {

        String username = tokenService.verifyRefreshToken(refreshToken);

        // rotate token
        tokenService.revokeToken(refreshToken);
        String newRefreshToken = tokenService.createRefreshToken(username);

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new BadRequestException("User not found"));

        String newAccessToken = tokenService.generateAccessToken(
                user.getUsername(),
                user.getRole().name()
        );

        //AUDIT 
        auditService.log(user.getUsername(), "REFRESH_TOKEN", "User refreshed token");

        return AuthResponse.builder()
                .accessToken(newAccessToken)
                .refreshToken(newRefreshToken)
                .role(user.getRole().name())
                .user(AuthMapper.toUserResponse(user))
                .build();
    }

    // ================= LOGOUT =================
    @Override
    public void logout(String refreshToken) {

        String username = tokenService.verifyRefreshToken(refreshToken);

        tokenService.revokeToken(refreshToken);

        //AUDIT
        auditService.log(username, "LOGOUT", "User logged out");
    }

   // ================= FORGOT PASSWORD =================
@Override
public void forgotPassword(String email) {

    //chuẩn hóa input (tránh lỗi space, hoa thường)
    email = email.trim().toLowerCase();

    // tìm user theo email
    User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));

    // tạo OTP 6 số
    String otp = String.valueOf((int)(Math.random() * 900000) + 100000);

    // lưu OTP theo email
    otpStore.save(email, otp);

    // gửi email
    emailService.send(
            email,
            "OTP Reset Password",
            "Mã OTP của bạn là: " + otp + " (hết hạn 5 phút)"
    );

    log.info("OTP sent to: {}", email); 
}

// ================= RESET PASSWORD =================
@Override
public void resetPassword(ResetPasswordRequest request) {

    //chuẩn hóa email
    String email = request.getEmail().trim().toLowerCase();

    // lấy OTP đã lưu
    String storedOtp = otpStore.get(email);


    log.info("EMAIL: '{}'", email);
    log.info("INPUT OTP: '{}'", request.getOtp());
    log.info("STORED OTP: '{}'", storedOtp);

    // kiểm tra OTP
    if (storedOtp == null || !storedOtp.equals(request.getOtp())) {
        throw new BadRequestException("Invalid OTP");
    }

    // tìm user theo email
    User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));

    if (!request.getNewPassword().equals(request.getConfirmPassword())) {
        throw new BadRequestException("Password không khớp");
    }

    // validate password
    if (request.getNewPassword() == null || request.getNewPassword().length() < 6) {
        throw new BadRequestException("Password too weak");
    }

    // cập nhật password
    user.setPassword(passwordEncoder.encode(request.getNewPassword()));
    userRepository.save(user);

    // xóa OTP sau khi dùng
    otpStore.remove(email);

    log.info("Password reset success for: {}", email);
}
}