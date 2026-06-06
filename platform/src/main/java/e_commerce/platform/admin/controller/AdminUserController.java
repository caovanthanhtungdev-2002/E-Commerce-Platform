package e_commerce.platform.admin.controller;

import e_commerce.platform.admin.dto.request.AdminUpdateUserRoleRequest;
import e_commerce.platform.admin.dto.response.AdminUserResponse;
import e_commerce.platform.admin.mapper.AdminUserMapper;
import e_commerce.platform.admin.service.AdminUserService;
import e_commerce.platform.modules.auth.enums.Role;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
public class AdminUserController {

    private final AdminUserService userService;

    // Lấy Role enum từ Authentication
    private Role getCurrentRole(Authentication authentication) {
        String roleStr = authentication.getAuthorities()
                .iterator().next().getAuthority()
                .replace("ROLE_", "");
        return Role.valueOf(roleStr);
    }

    @GetMapping
    public ResponseEntity<List<AdminUserResponse>> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        List<AdminUserResponse> result = userService.getAllUsers(page, size)
                .stream()
                .map(AdminUserMapper::toResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(result);
    }

    @GetMapping("/{id}")
    public ResponseEntity<AdminUserResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(AdminUserMapper.toResponse(userService.getUserById(id)));
    }

    @GetMapping("/search")
    public ResponseEntity<List<AdminUserResponse>> search(
            @RequestParam String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        List<AdminUserResponse> result = userService.searchUsers(keyword, page, size)
                .stream()
                .map(AdminUserMapper::toResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(result);
    }

    @GetMapping("/by-role")
    public ResponseEntity<List<AdminUserResponse>> getByRole(@RequestParam String role) {
        List<AdminUserResponse> result = userService.getUsersByRole(role)
                .stream()
                .map(AdminUserMapper::toResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(result);
    }

    @PatchMapping("/{id}/block")
    public ResponseEntity<Void> block(
            @PathVariable Long id,
            Authentication authentication) {
        userService.blockUser(id, authentication.getName());
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/{id}/activate")
    public ResponseEntity<Void> activate(
            @PathVariable Long id,
            Authentication authentication) {
        userService.activateUser(id, authentication.getName());
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/{id}/role")
    public ResponseEntity<Void> assignRole(
            @PathVariable Long id,
            @RequestBody @Valid AdminUpdateUserRoleRequest req,
            Authentication authentication) {
        userService.assignRole(id, req.getRole(),
                authentication.getName(), getCurrentRole(authentication));
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}/role")
    public ResponseEntity<Void> removeRole(
            @PathVariable Long id,
            Authentication authentication) {
        userService.removeRole(id,
                authentication.getName(), getCurrentRole(authentication));
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @PathVariable Long id,
            Authentication authentication) {
        userService.deleteUser(id,
                authentication.getName(), getCurrentRole(authentication));
        return ResponseEntity.ok().build();
    }
}