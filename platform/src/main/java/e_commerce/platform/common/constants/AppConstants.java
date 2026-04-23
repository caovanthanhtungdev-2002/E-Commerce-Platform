package e_commerce.platform.common.constants;

public final class AppConstants {

    private AppConstants() {}

    // Pagination
    public static final int DEFAULT_PAGE_SIZE = 10;
    public static final int MAX_PAGE_SIZE = 50;

    // Cache
    public static final int CACHE_TTL_5_MIN = 300;

    // Kafka topics
    public static final String REVIEW_TOPIC = "review-topic";
    public static final String ORDER_TOPIC = "order-topic";
    public static final String INVENTORY_TOPIC = "inventory-topic";

    // Roles
    public static final String ROLE_ADMIN = "ADMIN";
    public static final String ROLE_USER = "USER";
}