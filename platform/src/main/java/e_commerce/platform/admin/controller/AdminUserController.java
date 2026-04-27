package e_commerce.platform.admin.controller;

import lombok.RequiredArgsConstructor;
import e_commerce.platform.admin.service.AdminUserService;
import e_commerce.platform.modules.user.entity.User;
import org.springframework.web.bind.annotation.*;

import java.util.List;


@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
public class AdminUserController {

    private final AdminUserService userService;

    @GetMapping
    public List<User> getAll(int page, int size) {
        return userService.getAllUsers(page, size);
    }

    @PatchMapping("/{id}/block")
    public void block(@PathVariable Long id) {
        userService.blockUser(id);
    }

    @PatchMapping("/{id}/activate")
    public void activate(@PathVariable Long id) {
        userService.activateUser(id);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        userService.deleteUser(id);
    }
}
