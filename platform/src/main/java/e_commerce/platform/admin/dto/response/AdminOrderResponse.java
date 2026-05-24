package e_commerce.platform.admin.dto.response;

import e_commerce.platform.modules.order.enums.OrderStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;
import com.fasterxml.jackson.annotation.JsonFormat;

@Data
@Builder
public class AdminOrderResponse {

    private Long id;
    private Long userId;
    private String username;

    // Pricing
    private Double totalPrice;
    private Double discount;
    private Double finalPrice;
    private String couponCode;

    // Status
    private OrderStatus status;

    // Receiver info
    private String receiverName;
    private String address;
    private String phone;

    // Items
    private List<OrderItemResponse> items;

    // Timestamps
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
private LocalDateTime createdAt;

@JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
private LocalDateTime updatedAt;

    private String paymentMethod;

    // ---- inner DTO ----
    @Data
    @Builder
    public static class OrderItemResponse {
        private Long id;
        private Long productId;
        private String productName;
        private Double price;
        private Integer quantity;
        private Double totalPrice;
    }
}