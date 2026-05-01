package e_commerce.platform.modules.user.dto.request;

import lombok.Data;

import jakarta.validation.constraints.Size;



@Data
public class UpdateProfileRequest {

    @Size(min = 2, max = 50)
    private String fullName;

    private String phone;

    @Size(max = 255)
    private String address;

    @Size(max = 500)
    private String bio;
}
