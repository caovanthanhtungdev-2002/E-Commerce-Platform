package e_commerce.platform.modules.shipping.dto.response;

import lombok.*;

import java.time.LocalDateTime;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ShippingAddressResponse {

    private String id;
    private String receiverName;
    private String receiverPhone;
    private String addressLine;
    private String ward;
    private String district;
    private String province;
    private String country;
    private String note;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
