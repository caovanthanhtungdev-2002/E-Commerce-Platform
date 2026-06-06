package e_commerce.platform.admin.service;

import e_commerce.platform.modules.auth.enums.Role;
import e_commerce.platform.modules.user.entity.User;

import java.util.List;

public interface AdminUserService {

    List<User> getAllUsers(int page, int size);
    User getUserById(Long id);
    List<User> searchUsers(String keyword, int page, int size);
    List<User> getUsersByRole(String roleName);

    void blockUser(Long userId, String currentUsername);
    void activateUser(Long userId, String currentUsername);

    // currentRole là role của người đang thực hiện — để check phân cấp
    void assignRole(Long userId, Role role, String currentUsername, Role currentRole);
    void removeRole(Long userId, String currentUsername, Role currentRole);

    void resetPassword(Long userId, String newPassword);
    void deleteUser(Long userId, String currentUsername, Role currentRole);
}