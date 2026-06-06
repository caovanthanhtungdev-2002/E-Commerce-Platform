package e_commerce.platform.modules.order.enums;

public enum OrderStatus {
    AWAITING_PAYMENT, // VNPAY chưa thanh toán (thay PENDING cho VNPAY)
    PENDING,          // COD chờ nhân viên xác nhận
    CONFIRMED,        
    PROCESSING,       
    SHIPPED,          
    DELIVERED,        
    PAID,             // VNPAY đã thanh toán thành công
    CANCELLED,        
    REFUNDED,         
    COMPLETED,        
    RETURNED
}