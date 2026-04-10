package e_commerce.platform.modules.auth.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import e_commerce.platform.common.response.ApiResponse;
import e_commerce.platform.modules.auth.dto.request.LoginRequest;
import e_commerce.platform.modules.auth.dto.request.RefreshRequest;
import e_commerce.platform.modules.auth.dto.request.RegisterRequest;
import e_commerce.platform.modules.auth.dto.response.AuthResponse;
import e_commerce.platform.modules.auth.dto.response.UserResponse;
import e_commerce.platform.modules.auth.service.AuthService;
import lombok.RequiredArgsConstructor;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Validated
public class AuthController {

    private final AuthService authService;

    // REGISTER
    @PostMapping("/register")
    public ResponseEntity<ApiResponse<UserResponse>> register(
            @Valid @RequestBody RegisterRequest request) {

        UserResponse data = authService.register(request);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ApiResponse<>(true, "Register success", data));
    }

    // LOGIN
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(
            @Valid @RequestBody LoginRequest request) {

        AuthResponse data = authService.login(request);

        return ResponseEntity.ok(
                new ApiResponse<>(true, "Login success", data)
        );
    }

    // REFRESH TOKEN
    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<AuthResponse>> refresh(
            @RequestBody RefreshRequest request) {

        AuthResponse data = authService.refresh(request.getRefreshToken());

        return ResponseEntity.ok(
                new ApiResponse<>(true, "Refreshed", data)
        );
    }

    // LOGOUT
    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout(
            @RequestBody RefreshRequest request) {

        authService.logout(request.getRefreshToken());

        return ResponseEntity.ok(
                new ApiResponse<>(true, "Logout success", null)
        );
    }
}