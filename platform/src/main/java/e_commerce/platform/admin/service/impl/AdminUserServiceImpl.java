    package e_commerce.platform.admin.service.impl;

    import e_commerce.platform.admin.service.AdminUserService;
    import e_commerce.platform.modules.auth.enums.Role;
    import e_commerce.platform.modules.user.entity.User;
    import e_commerce.platform.modules.user.repository.UserRepository;
    import e_commerce.platform.exception.BadRequestException;
    import e_commerce.platform.exception.ForbiddenException;
    import e_commerce.platform.exception.ResourceNotFoundException;

    import lombok.RequiredArgsConstructor;
    import org.springframework.data.domain.PageRequest;
    import org.springframework.data.domain.Pageable;
    import org.springframework.security.crypto.password.PasswordEncoder;
    import org.springframework.stereotype.Service;
    import org.springframework.transaction.annotation.Transactional;

    import java.util.List;

    @Service
    @RequiredArgsConstructor
    @Transactional
    public class AdminUserServiceImpl implements AdminUserService {

        private final UserRepository userRepository;
        private final PasswordEncoder passwordEncoder;

        // Định nghĩa role nào có thể quản lý role nào
        // ADMIN → quản lý tất cả trừ ROOT
        // MANAGER → chỉ quản lý STAFF, WAREHOUSE, SHIPPER, USER
        private static final List<Role> MANAGER_ALLOWED_ROLES =
                List.of(Role.STAFF, Role.WAREHOUSE, Role.SHIPPER, Role.USER);

        // ================= GET ALL =================
        @Override
        public List<User> getAllUsers(int page, int size) {
            Pageable pageable = PageRequest.of(page, size);
            return userRepository.findAll(pageable).getContent();
        }

        // ================= GET BY ID =================
        @Override
        public User getUserById(Long id) {
            return userRepository.findById(id)
                    .orElseThrow(() -> new ResourceNotFoundException("User not found: " + id));
        }

        // ================= SEARCH =================
        @Override
        public List<User> searchUsers(String keyword, int page, int size) {
            if (keyword == null || keyword.trim().isEmpty()) {
                throw new BadRequestException("Keyword is required");
            }
            Pageable pageable = PageRequest.of(page, size);
            return userRepository
                    .findByUsernameContainingIgnoreCaseOrEmailContainingIgnoreCase(
                            keyword.trim(), keyword.trim(), pageable)
                    .getContent();
        }

        // ================= FILTER BY ROLE =================
        @Override
        public List<User> getUsersByRole(String roleName) {
            if (roleName == null || roleName.trim().isEmpty()) {
                throw new BadRequestException("Role name is required");
            }
            try {
                Role role = Role.valueOf(roleName.trim().toUpperCase());
                return userRepository.findByRole(role);
            } catch (IllegalArgumentException e) {
                throw new BadRequestException("Invalid role: " + roleName);
            }
        }

        // ================= BLOCK =================
@Override
public void blockUser(Long userId, String currentUsername) {
    User user = getUserById(userId);

    if (user.getUsername().equals(currentUsername)) {
        throw new BadRequestException("Cannot block yourself");
    }
    if (user.getRole() == Role.ROOT) {
        throw new ForbiddenException("Cannot block ROOT account");
    }
    //chặn ADMIN — ROOT được block ADMIN
    if (!user.isEnabled()) {
        throw new BadRequestException("User is already blocked");
    }

    user.setEnabled(false);
}

        // ================= ACTIVATE =================
        @Override
        public void activateUser(Long userId, String currentUsername) {
            User user = getUserById(userId);

            if (user.getUsername().equals(currentUsername)) {
                throw new BadRequestException("Cannot activate yourself");
            }
            if (user.isEnabled()) {
                throw new BadRequestException("User is already active");
            }

            user.setEnabled(true);
        }

        // ================= ASSIGN ROLE =================
@Override
public void assignRole(Long userId, Role role, String currentUsername, Role currentRole) {
    if (role == null) {
        throw new BadRequestException("Role is required");
    }

    User user = getUserById(userId);

    // Guard 1: không tự đổi role chính mình
    if (user.getUsername().equals(currentUsername)) {
        throw new BadRequestException("Cannot change your own role");
    }

    // Guard 2: không ai được assign ROOT
    if (role == Role.ROOT) {
        throw new ForbiddenException("Cannot assign ROOT role");
    }

    // Guard 3: không đụng vào ROOT user
    if (user.getRole() == Role.ROOT) {
        throw new ForbiddenException("Cannot change role of ROOT account");
    }

    // ROOT bypass tất cả guard bên dưới
    if (currentRole == Role.ROOT) {
        user.setRole(role);
        return;
    }

    // Guard 4: ADMIN không được đụng vào ADMIN khác
    if (currentRole == Role.ADMIN && user.getRole() == Role.ADMIN) {
        throw new ForbiddenException("Cannot change role of another ADMIN account");
    }

    // Guard 5: ADMIN không được assign role ADMIN cho người khác
    if (currentRole == Role.ADMIN && role == Role.ADMIN) {
        throw new ForbiddenException("Cannot assign ADMIN role");
    }

    // Guard 6: MANAGER chỉ được assign role thấp hơn mình
    if (currentRole == Role.MANAGER && !MANAGER_ALLOWED_ROLES.contains(role)) {
        throw new ForbiddenException("Manager can only assign STAFF, WAREHOUSE, SHIPPER, USER");
    }

    // Guard 7: MANAGER không được đụng vào ADMIN
    if (currentRole == Role.MANAGER && user.getRole() == Role.ADMIN) {
        throw new ForbiddenException("Manager cannot change Admin's role");
    }

    user.setRole(role);
}


        // ================= REMOVE ROLE =================
@Override
public void removeRole(Long userId, String currentUsername, Role currentRole) {
    User user = getUserById(userId);

    if (user.getUsername().equals(currentUsername)) {
        throw new BadRequestException("Cannot remove your own role");
    }
    if (user.getRole() == Role.ROOT) {
        throw new ForbiddenException("Cannot remove role of ROOT account");
    }

    // ROOT bypass tất cả guard bên dưới
    if (currentRole == Role.ROOT) {
        user.setRole(Role.USER);
        return;
    }

    if (user.getRole() == Role.USER) {
        throw new BadRequestException("User already has base role USER");
    }
    if (currentRole == Role.MANAGER && user.getRole() == Role.ADMIN) {
        throw new ForbiddenException("Manager cannot remove Admin's role");
    }

    user.setRole(Role.USER);
}

        // ================= RESET PASSWORD =================
        @Override
        public void resetPassword(Long userId, String newPassword) {
            if (newPassword == null || newPassword.trim().length() < 6) {
                throw new BadRequestException("Password must be at least 6 characters");
            }
            User user = getUserById(userId);

            if (user.getRole() == Role.ROOT) {
                throw new ForbiddenException("Cannot reset ROOT password");
            }

            user.setPassword(passwordEncoder.encode(newPassword));
        }

        // ================= DELETE =================
@Override
public void deleteUser(Long userId, String currentUsername, Role currentRole) {
    User user = getUserById(userId);

    if (user.getUsername().equals(currentUsername)) {
        throw new BadRequestException("Cannot delete yourself");
    }
    if (user.getRole() == Role.ROOT) {
        throw new ForbiddenException("Cannot delete ROOT account");
    }

    if (currentRole == Role.ROOT) {
        userRepository.delete(user);
        return;
    }

    if (currentRole == Role.ADMIN && user.getRole() == Role.ADMIN) {
        throw new ForbiddenException("Cannot delete another ADMIN account");
    }
    if (currentRole == Role.MANAGER && user.getRole() == Role.ADMIN) {
        throw new ForbiddenException("Manager cannot delete Admin account");
    }

    userRepository.delete(user);
}
    }