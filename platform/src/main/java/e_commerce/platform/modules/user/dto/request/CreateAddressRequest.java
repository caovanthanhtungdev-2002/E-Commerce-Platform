package e_commerce.platform.modules.user.dto.request;

import lombok.Data;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;


@Data
public class CreateAddressRequest {

    @NotBlank(message = "Tên người nhận không được để trống")
    private String receiverName;

    @NotBlank(message = "Số điện thoại không được để trống")
    @Pattern(
    regexp = "^(\\+84|0)(3[2-9]|5[6-9]|7[0|6-9]|8[0-9]|9[0-9])[0-9]{7}$",
    message = "SĐT không hợp lệ"
)
private String receiverPhone;

    @NotBlank(message = "Địa chỉ không được để trống")
    private String addressLine;

    @NotBlank(message = "Phường/xã không được để trống")
    private String ward;

    @NotBlank(message = "Quận/huyện không được để trống")
    private String district;

    @NotBlank(message = "Tỉnh/thành phố không được để trống")
    private String province;

    private String country;

    private String postalCode;

  
    private Boolean isDefault = false;
}