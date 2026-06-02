package e_commerce.platform.modules.user.controller;

import e_commerce.platform.common.response.ApiResponse;
import e_commerce.platform.modules.auth.dto.response.UserResponse;
import e_commerce.platform.modules.file.service.CloudinaryService;
import e_commerce.platform.modules.user.dto.request.ChangePasswordRequest;
import e_commerce.platform.modules.user.dto.request.UpdateProfileRequest;
import e_commerce.platform.modules.user.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final CloudinaryService cloudinaryService;

    @GetMapping("/profile")
    public ApiResponse<UserResponse> getProfile(Authentication authentication) {
        return new ApiResponse<>(true, "Success", userService.getProfile(authentication.getName()));
    }

    @GetMapping("/me")
    public ApiResponse<UserResponse> getMe(Authentication authentication) {
        return new ApiResponse<>(true, "OK", userService.getProfile(authentication.getName()));
    }

    @PutMapping("/profile")
    public ApiResponse<UserResponse> updateProfile(
            @Valid @RequestBody UpdateProfileRequest request, Authentication authentication) {
        return new ApiResponse<>(true, "Updated", userService.updateProfile(authentication.getName(), request));
    }

    @PostMapping("/change-password")
    public ApiResponse<Void> changePassword(
            @Valid @RequestBody ChangePasswordRequest request, Authentication authentication) {
        userService.changePassword(authentication.getName(), request);
        return new ApiResponse<>(true, "Password changed", null);
    }

    @PostMapping("/avatar")
    public ApiResponse<String> uploadAvatar(
            @RequestParam("file") MultipartFile file, Authentication authentication) {
        String url = cloudinaryService.upload(file);
        userService.updateAvatar(authentication.getName(), url);
        return new ApiResponse<>(true, "Uploaded", url);
    }
}