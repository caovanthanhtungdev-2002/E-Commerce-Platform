package e_commerce.platform.modules.auth.enums;

public enum Role {
    ROOT,       // Superadmin — toàn quyền
    ADMIN,      // Quản trị viên
    MANAGER,    // Quản lý cửa hàng
    STAFF,      // Nhân viên bán hàng
    WAREHOUSE,  // Thủ kho
    SHIPPER,    // Giao hàng
    USER        // Khách hàng
}