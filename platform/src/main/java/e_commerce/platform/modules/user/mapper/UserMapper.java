package e_commerce.platform.modules.user.mapper;

import e_commerce.platform.modules.auth.dto.response.UserResponse;
import e_commerce.platform.modules.user.entity.User;

public class UserMapper {

   public static UserResponse toResponse(User user) {
    return UserResponse.builder()
            .username(user.getUsername())
            .email(user.getEmail())   
            .fullName(user.getFullName())
            .phone(user.getPhone())
            .address(user.getAddress())
            .bio(user.getBio())
            .avatar(user.getAvatar())
            .role(user.getRole().name())
            .build();
}
}