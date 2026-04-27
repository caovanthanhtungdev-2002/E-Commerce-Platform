package e_commerce.platform.admin.controller;

import e_commerce.platform.admin.service.AdminDashboardService;

import lombok.RequiredArgsConstructor;

import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/dashboard")
@RequiredArgsConstructor
public class AdminDashboardController {

    private final AdminDashboardService dashboardService;

    @GetMapping("/summary")
    public Object summary() {
        return new Object() {
            public final Double revenue = dashboardService.getTotalRevenue();
            public final Long orders = dashboardService.getTotalOrders();
            public final Long users = dashboardService.getTotalUsers();
            public final Long products = dashboardService.getTotalProducts();
        };
    }

    @GetMapping("/revenue")
    public List<Object[]> revenue() {
        return dashboardService.getRevenueByDay();
    }

    @GetMapping("/top-products")
    public List<Object[]> topProducts() {
        return dashboardService.getTopSellingProducts();
    }

    @GetMapping("/order-status")
    public List<Object[]> orderStats() {
        return dashboardService.getOrderStatusStats();
    }
}