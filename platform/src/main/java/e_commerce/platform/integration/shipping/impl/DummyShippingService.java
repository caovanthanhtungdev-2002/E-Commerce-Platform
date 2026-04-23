package e_commerce.platform.integration.shipping.impl;

import e_commerce.platform.integration.shipping.ShippingService;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class DummyShippingService implements ShippingService {

    @Override
    public String createShipment(Long orderId, String address) {

        // giả lập tạo đơn giao hàng
        return "SHIP-" + UUID.randomUUID();
    }
}