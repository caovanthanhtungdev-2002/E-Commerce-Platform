package e_commerce.platform.modules.user.controller;

import e_commerce.platform.common.response.ApiResponse;
import e_commerce.platform.modules.auth.dto.response.UserResponse;
import e_commerce.platform.modules.user.dto.request.ChangePasswordRequest;
import e_commerce.platform.modules.user.dto.request.UpdateProfileRequest;
import e_commerce.platform.modules.user.service.UserService;

import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.Page;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @PutMapping("/profile")
    public ApiResponse<UserResponse> updateProfile(
            @RequestBody UpdateProfileRequest request,
            Authentication authentication
    ) {
        return new ApiResponse<>(
                true,
                "Updated",
                userService.updateProfile(authentication.getName(), request)
        );
    }

    @PostMapping("/change-password")
    public ApiResponse<Void> changePassword(
            @RequestBody ChangePasswordRequest request,
            Authentication authentication
    ) {
        userService.changePassword(authentication.getName(), request);

        return new ApiResponse<>(true, "Password changed", null);
    }

    @GetMapping("/list")
    public ApiResponse<Page<UserResponse>> getUsers(
            @RequestParam int page,
            @RequestParam int size
    ) {
        return new ApiResponse<>(
                true,
                "Success",
                userService.getUsers(page, size)
        );
    }

    @PostMapping("/avatar")
    public ApiResponse<String> uploadAvatar(
            @RequestParam("file") MultipartFile file,
            Authentication authentication
    ) {

        // giả sử bạn đã có fileStorageService
        String url = "TODO_UPLOAD";

        userService.updateAvatar(authentication.getName(), url);

        return new ApiResponse<>(true, "Uploaded", url);
    }
}
