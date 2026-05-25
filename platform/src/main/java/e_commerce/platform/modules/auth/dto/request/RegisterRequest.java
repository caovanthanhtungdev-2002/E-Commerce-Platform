package e_commerce.platform.modules.auth.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

@Data
public class RegisterRequest {

    @NotBlank(message = "Username không được để trống")
    @Size(min = 3, max = 30, message = "Username từ 3-30 ký tự")
    @Pattern(regexp = "^[a-zA-Z0-9_]+$", message = "Username chỉ chứa chữ, số và dấu _")
    private String username;

    @NotBlank(message = "Email không được để trống")
    @Email(message = "Email không hợp lệ")
    private String email;

    @NotBlank(message = "Password không được để trống")
    @Size(min = 6, max = 50, message = "Password từ 6-50 ký tự")
    private String password;

    @NotBlank(message = "Xác nhận password không được để trống")
    private String confirmPassword;

    @Pattern(regexp = "^(\\+84|0)[3|5|7|8|9][0-9]{8}$", message = "Số điện thoại không hợp lệ")
    private String phone;

    @Size(max = 100)
    private String fullName;
}