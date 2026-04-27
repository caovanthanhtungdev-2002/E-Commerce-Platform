package e_commerce.platform.admin.mapper;

import e_commerce.platform.admin.dto.response.AdminDashboardResponse;

public class AdminDashboardMapper {

    public static AdminDashboardResponse toResponse(
            Double totalRevenue,
            Long totalOrders,
            Long totalUsers,
            Long totalProducts
    ) {
        return AdminDashboardResponse.builder()
                .totalRevenue(totalRevenue != null ? totalRevenue : 0.0)
                .totalOrders(totalOrders   != null ? totalOrders  : 0L)
                .totalUsers(totalUsers     != null ? totalUsers   : 0L)
                .totalProducts(totalProducts != null ? totalProducts : 0L)
                .build();
    }
}