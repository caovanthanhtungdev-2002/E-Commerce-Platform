package e_commerce.platform.modules.order.dto.response;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class OrderResponse {

    private Long id;
    private Double totalPrice;
    private String status;
    private List<OrderItemResponse> items;
        
    // thêm coupon 
    private Double discount;
    private Double finalPrice;
    private String couponCode;
}