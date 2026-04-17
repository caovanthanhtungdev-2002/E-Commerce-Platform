package e_commerce.platform.modules.user.service.impl;

import e_commerce.platform.exception.BadRequestException;
import e_commerce.platform.exception.ConflictException;
import e_commerce.platform.exception.ResourceNotFoundException;
import e_commerce.platform.exception.UnauthorizedException;
import e_commerce.platform.modules.audit.service.AuditService;
import e_commerce.platform.modules.auth.dto.response.UserResponse;
import e_commerce.platform.modules.user.dto.request.ChangePasswordRequest;
import e_commerce.platform.modules.user.dto.request.UpdateProfileRequest;
import e_commerce.platform.modules.user.entity.User;
import e_commerce.platform.modules.user.mapper.UserMapper;
import e_commerce.platform.modules.user.repository.UserRepository;
import e_commerce.platform.modules.user.service.UserService;

import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuditService auditService;

    // ================= UPDATE PROFILE =================
    @Override
    public UserResponse updateProfile(String username, UpdateProfileRequest request) {

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // validate phone unique
        if (request.getPhone() != null &&
                !request.getPhone().equals(user.getPhone()) &&
                userRepository.existsByPhone(request.getPhone())) {

            throw new ConflictException("Phone already exists");
        }

        // update only if not null
        if (request.getFullName() != null) {
            user.setFullName(request.getFullName());
        }

        if (request.getPhone() != null) {
            user.setPhone(request.getPhone());
        }

        userRepository.save(user);

        auditService.log(username, "UPDATE_PROFILE", "User updated profile");

        return UserMapper.toResponse(user);
    }

    // ================= CHANGE PASSWORD =================
    @Override
    public void changePassword(String username, ChangePasswordRequest request) {

        if (request.getOldPassword() == null || request.getNewPassword() == null) {
            throw new BadRequestException("Password is required");
        }

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (!passwordEncoder.matches(request.getOldPassword(), user.getPassword())) {
            throw new UnauthorizedException("Wrong password");
        }

        if (request.getNewPassword().length() < 6) {
            throw new BadRequestException("Password too weak");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        auditService.log(username, "CHANGE_PASSWORD", "User changed password");
    }

    // ================= GET USERS (PAGINATION) =================
    @Override
    public Page<UserResponse> getUsers(int page, int size) {

        Pageable pageable = PageRequest.of(page, size);

        return userRepository.findAll(pageable)
                .map(UserMapper::toResponse);
    }

    // ================= UPDATE AVATAR =================
    @Override
    public void updateAvatar(String username, String avatarUrl) {

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        user.setAvatar(avatarUrl);
        userRepository.save(user);

        auditService.log(username, "UPDATE_AVATAR", "User updated avatar");
    }
}