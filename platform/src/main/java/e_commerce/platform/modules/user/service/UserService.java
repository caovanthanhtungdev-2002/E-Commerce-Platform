package e_commerce.platform.modules.user.service;

import org.springframework.data.domain.Page;

import e_commerce.platform.modules.auth.dto.response.UserResponse;
import e_commerce.platform.modules.user.dto.request.ChangePasswordRequest;
import e_commerce.platform.modules.user.dto.request.UpdateProfileRequest;

public interface UserService {

    UserResponse updateProfile(String username, UpdateProfileRequest request);

    void changePassword(String username, ChangePasswordRequest request);

    Page<UserResponse> getUsers(int page, int size);

    void updateAvatar(String username, String avatarUrl);
}