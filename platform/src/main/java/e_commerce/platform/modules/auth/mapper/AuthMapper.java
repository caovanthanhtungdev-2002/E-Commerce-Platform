package e_commerce.platform.modules.auth.mapper;

import e_commerce.platform.modules.auth.dto.response.UserResponse;
import e_commerce.platform.modules.user.entity.User;

public class AuthMapper {

    public static UserResponse toUserResponse(User user) {
        return UserResponse.builder()
                .username(user.getUsername())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .phone(user.getPhone())
                .bio(user.getBio())
                .avatar(user.getAvatar())
                .role(user.getRole().name())
                .build();
    }
}