package e_commerce.platform.modules.order.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
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

    // Thông tin giao hàng
    private String receiverName;
private String phone;
private String address;

private String paymentMethod;

 private LocalDateTime createdAt;
 private LocalDateTime updatedAt;
}