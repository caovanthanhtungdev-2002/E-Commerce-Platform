package e_commerce.platform.modules.coupon.dto.response;


import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class CouponResponse {

    private String code;
    private double discount;
    private double finalAmount;
}