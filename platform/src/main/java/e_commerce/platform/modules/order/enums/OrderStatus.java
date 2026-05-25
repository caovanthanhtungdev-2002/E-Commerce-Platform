package e_commerce.platform.modules.order.enums;

public enum OrderStatus {
    PENDING,     // chờ xác nhận
    CONFIRMED,   // nhân viên đã xác nhận, đang chuẩn bị hàng
    PROCESSING,  // đang xử lý / đóng gói
    SHIPPED,     // đã giao cho đơn vị vận chuyển
    DELIVERED,   // đã giao đến tay khách
    PAID,        // đã thanh toán online (VNPAY)
    CANCELLED,   // huỷ
    REFUNDED,    // đã hoàn tiền cho đơn VNPAY bị huỷ
    COMPLETED,   // đơn hoàn tất
    RETURNED
}