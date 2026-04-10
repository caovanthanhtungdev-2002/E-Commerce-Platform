package e_commerce.platform.modules.auth.service.impl;

import e_commerce.platform.modules.auth.service.TokenService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import e_commerce.platform.exception.BadRequestException;
import e_commerce.platform.exception.ConflictException;
import e_commerce.platform.exception.UnauthorizedException;
import e_commerce.platform.modules.auth.dto.request.LoginRequest;
import e_commerce.platform.modules.auth.dto.request.RegisterRequest;
import e_commerce.platform.modules.auth.dto.response.AuthResponse;
import e_commerce.platform.modules.auth.dto.response.UserResponse;
import e_commerce.platform.modules.auth.entity.*;
import e_commerce.platform.modules.auth.mapper.AuthMapper;
import e_commerce.platform.modules.auth.repository.*;
import e_commerce.platform.modules.auth.service.AuthService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final TokenService tokenService;

    // ================= REGISTER =================
    @Override
    public UserResponse register(RegisterRequest request) {

        log.info("Register user: {}", request.getUsername());

        if (userRepository.existsByUsername(request.getUsername())) {
            throw new ConflictException("Username already exists");
        }

        if (userRepository.existsByPhone(request.getPhone())) {
            throw new ConflictException("Phone already exists");
        }

        User user = User.builder()
                .username(request.getUsername())
                .password(passwordEncoder.encode(request.getPassword()))
                .phone(request.getPhone())
                .fullName(request.getFullName())
                .role(Role.USER)
                .build();

        userRepository.save(user);

        return AuthMapper.toUserResponse(user);
    }

    // ================= LOGIN =================
    @Override
    public AuthResponse login(LoginRequest request) {

        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new UnauthorizedException("Invalid credentials"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new UnauthorizedException("Invalid credentials");
        }

        String accessToken = tokenService.generateAccessToken(
                user.getUsername(),
                user.getRole().name()
        );

        String refreshToken = tokenService.createRefreshToken(user.getUsername());

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken) 
                .role(user.getRole().name())
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

        return AuthResponse.builder()
                .accessToken(newAccessToken)
                .refreshToken(newRefreshToken) 
                .role(user.getRole().name())
                .build();
    }

    // ================= LOGOUT =================
    @Override
    public void logout(String refreshToken) {
        tokenService.revokeToken(refreshToken);
    }
}