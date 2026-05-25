package e_commerce.platform.admin.service;

import java.util.List;

public interface AdminDashboardService {

    Double getTotalRevenue();

    Long getTotalOrders();

    Long getTotalUsers();

    Long getTotalProducts();

    List<Object[]> getRevenueByDay();

    List<Object[]> getTopSellingProducts();

    List<Object[]> getOrderStatusStats();

    Double getCodCollected();

Long getCodOrderCount();

List<Object[]> getCodRevenueByDay();
}