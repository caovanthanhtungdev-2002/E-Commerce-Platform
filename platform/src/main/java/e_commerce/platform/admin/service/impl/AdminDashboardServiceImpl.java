package e_commerce.platform.admin.service.impl;

import e_commerce.platform.admin.service.AdminDashboardService;

import e_commerce.platform.modules.order.repository.OrderRepository;
import e_commerce.platform.modules.user.repository.UserRepository;
import e_commerce.platform.modules.product.repository.ProductRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminDashboardServiceImpl implements AdminDashboardService {

    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;

    // ================= TOTAL REVENUE =================
    @Override
    public Double getTotalRevenue() {

        Double revenue = orderRepository.sumRevenue();

        return revenue != null ? revenue : 0.0;
    }

    // ================= TOTAL ORDERS =================
    @Override
    public Long getTotalOrders() {
        return orderRepository.count();
    }

    // ================= TOTAL USERS =================
    @Override
    public Long getTotalUsers() {
        return userRepository.count();
    }

    // ================= TOTAL PRODUCTS =================
    @Override
    public Long getTotalProducts() {
        return productRepository.count();
    }

    // ================= REVENUE BY DAY =================
    @Override
    public List<Object[]> getRevenueByDay() {

        return orderRepository.revenueByDay();
    }

    // ================= TOP SELLING PRODUCTS =================
    @Override
    public List<Object[]> getTopSellingProducts() {

        return orderRepository.topSellingProducts();
    }

    // ================= ORDER STATUS STATS =================
    @Override
    public List<Object[]> getOrderStatusStats() {

        return orderRepository.orderStatusStats();
    }

    @Override
public Double getCodCollected() {
    Double val = orderRepository.sumCodCollected();
    return val != null ? val : 0.0;
}

@Override
public Long getCodOrderCount() {
    Long val = orderRepository.countCodCollected();
    return val != null ? val : 0L;
}

@Override
public List<Object[]> getCodRevenueByDay() {
    return orderRepository.codRevenueByDay();
}

}