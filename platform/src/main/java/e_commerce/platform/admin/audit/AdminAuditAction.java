package e_commerce.platform.admin.audit;

public enum AdminAuditAction {

    // ===== PRODUCT =====
    CREATE_PRODUCT,
    UPDATE_PRODUCT,
    DELETE_PRODUCT,
    APPROVE_PRODUCT,
    DISABLE_PRODUCT,

    // ===== ORDER =====
    UPDATE_ORDER_STATUS,
    CANCEL_ORDER,
    REFUND_ORDER,

    // ===== USER =====
    BLOCK_USER,
    ACTIVATE_USER,
    ASSIGN_ROLE,
    REMOVE_ROLE,

    // ===== PAYMENT =====
    REFUND_PAYMENT,
    MARK_PAYMENT_FAILED,

    // ===== INVENTORY =====
    INCREASE_STOCK,
    DECREASE_STOCK,

    // ===== CONFIG =====
    UPDATE_CONFIG,
    DELETE_CONFIG,

    // ===== COUPON =====
    CREATE_COUPON,
    UPDATE_COUPON,
    DELETE_COUPON,

    // ===== SYSTEM =====
    LOGIN_ADMIN,
    LOGOUT_ADMIN
}