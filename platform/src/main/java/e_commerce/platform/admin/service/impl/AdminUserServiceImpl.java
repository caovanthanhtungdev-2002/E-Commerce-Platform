package e_commerce.platform.admin.service.impl;

import e_commerce.platform.admin.service.AdminUserService;
import e_commerce.platform.modules.user.entity.User;
import e_commerce.platform.modules.user.repository.UserRepository;
import e_commerce.platform.modules.auth.enums.Role;
import e_commerce.platform.exception.ResourceNotFoundException;
import e_commerce.platform.exception.BadRequestException;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class AdminUserServiceImpl implements AdminUserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

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
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
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
                        keyword.trim(), keyword.trim(), pageable
                )
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
    public void blockUser(Long userId) {
        User user = getUserById(userId);
        if (!user.isEnabled()) {
            throw new BadRequestException("User is already blocked");
        }
        user.setEnabled(false);
    }

    // ================= ACTIVATE =================
    @Override
    public void activateUser(Long userId) {
        User user = getUserById(userId);
        if (user.isEnabled()) {
            throw new BadRequestException("User is already active");
        }
        user.setEnabled(true);
    }

    // ================= ASSIGN ROLE =================
   @Override
public void assignRole(Long userId, Role role) {

    if (role == null) {
        throw new BadRequestException("Role is required");
    }

    User user = getUserById(userId);

    // SECURITY: chặn set ROOT
    if (role == Role.ROOT) {
        throw new BadRequestException("Cannot assign ROOT role");
    }

    user.setRole(role);
}

    // ================= REMOVE ROLE =================
    @Override
    public void removeRole(Long userId) {
        User user = getUserById(userId);
        if (user.getRole() == null) {
            throw new BadRequestException("User has no role to remove");
        }
        user.setRole(null);
    }

    // ================= RESET PASSWORD =================
    @Override
    public void resetPassword(Long userId, String newPassword) {
        if (newPassword == null || newPassword.trim().length() < 6) {
            throw new BadRequestException("Password must be at least 6 characters");
        }
        User user = getUserById(userId);
        user.setPassword(passwordEncoder.encode(newPassword));
    }

    // ================= DELETE =================
    @Override
    public void deleteUser(Long userId) {
        if (!userRepository.existsById(userId)) {
            throw new ResourceNotFoundException("User not found with id: " + userId);
        }
        userRepository.deleteById(userId);
    }
}