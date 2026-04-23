package e_commerce.platform.integration.shipping;

public interface ShippingService {

    String createShipment(Long orderId, String address);

}