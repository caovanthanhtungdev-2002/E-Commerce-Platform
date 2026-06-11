package e_commerce.platform.modules.coupon.dto.response;


import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class CouponResponse {

    private String code;
    private String type;         // PERCENTAGE | FREESHIP | FIXED
    private double discount;
    private double finalAmount;
}