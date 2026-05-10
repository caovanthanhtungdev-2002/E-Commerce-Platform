package e_commerce.platform.modules.order.dto.request;

import lombok.Data;
import java.util.List;


@Data
public class CreateOrderRequest {
    // future: address, paymentMethod
    private String couponCode;

     private String receiverName;
    private String phone;
    private String address;

    private String paymentMethod;

    private List<Long> selectedProductIds;
                                                                                                                        
    
}