package e_commerce.platform.modules.user.dto.response;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class AddressResponse {
    private Long id;
    private String receiverName;
    private String receiverPhone;
    private String addressLine;
    private String ward;
    private String district;
    private String province;
    private String postalCode;
    private String country;
    private Boolean isDefault;
    private LocalDateTime createdAt;
    
}