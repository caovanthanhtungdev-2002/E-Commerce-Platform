package e_commerce.platform.admin.mapper;

import e_commerce.platform.admin.dto.response.AdminUserResponse;
import e_commerce.platform.modules.user.entity.User;

public class AdminUserMapper {

    // User entity không có createdAt nên để null
    // nếu sau này thêm createdAt vào entity thì update lại
    public static AdminUserResponse toResponse(User user) {
        if (user == null) return null;

        return AdminUserResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .role(user.getRole())
                .enabled(user.isEnabled())
                .createdAt(user.getCreatedAt())
                .build();
    }
}