package e_commerce.platform.modules.order.dto.request;

import java.util.List;

import lombok.Data;


@Data
public class CreateOrderRequest {
    // future: address, paymentMethod
    private String couponCode;

     private String receiverName;
    private String phone;
    private String address;

    private String paymentMethod;

    private List<Long> selectedProductIds;

    private List<BuyNowItem> buyNowItems;
                   
    @Data
    public static class BuyNowItem {
        private Long productId;
        private Integer quantity;
    }
    
}