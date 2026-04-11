package e_commerce.platform.modules.user.mapper;

import e_commerce.platform.modules.auth.dto.response.UserResponse;
import e_commerce.platform.modules.auth.entity.User;

public class UserMapper {

    public static UserResponse toResponse(User user) {
        return UserResponse.builder()
                .username(user.getUsername())
                .fullName(user.getFullName())
                .phone(user.getPhone())
                .role(user.getRole().name())
                .build();
    }
}