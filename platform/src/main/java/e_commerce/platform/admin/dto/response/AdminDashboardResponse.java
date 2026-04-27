package e_commerce.platform.admin.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AdminDashboardResponse {

    private Double totalRevenue;

    private Long totalOrders;

    private Long totalUsers;

    private Long totalProducts;
}