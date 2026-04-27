package e_commerce.platform.admin.service;

import java.util.List;
import e_commerce.platform.modules.user.entity.User;
import e_commerce.platform.modules.auth.enums.Role;

public interface AdminUserService {

 List<User> getAllUsers(int page, int size);

 User getUserById(Long id);

 List<User> searchUsers(String keyword, int page, int size);

 List<User> getUsersByRole(String role);

 void blockUser(Long userId);

 void activateUser(Long userId);

 void assignRole(Long userId, Role role);

 void removeRole(Long userId);

 void resetPassword(Long userId, String newPassword);

 void deleteUser(Long userId);
                                                                                    
}