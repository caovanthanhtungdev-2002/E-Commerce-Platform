package e_commerce.platform.modules.shipping.service;

import e_commerce.platform.modules.shipping.dto.request.AddTrackingEventRequest;
import e_commerce.platform.modules.shipping.dto.request.CreateShipmentRequest;
import e_commerce.platform.modules.shipping.dto.request.UpdateShipmentStatusRequest;
import e_commerce.platform.modules.shipping.dto.response.ShipmentResponse;
import e_commerce.platform.modules.shipping.dto.response.TrackingEventResponse;
import e_commerce.platform.modules.shipping.enums.ShipmentStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
 
import java.util.List;
 
public interface ShipmentService {
 
    Page<ShipmentResponse> getAll(ShipmentStatus status, String carrier,
                                  String search, Pageable pageable);
 
    ShipmentResponse getById(String id);
 
    ShipmentResponse getByOrder(String orderId);
 
    ShipmentResponse create(CreateShipmentRequest req);
 
    ShipmentResponse updateStatus(String id, UpdateShipmentStatusRequest req);
 
    void delete(String id);
 
    List<TrackingEventResponse> getTrackingEvents(String shipmentId);
 
    TrackingEventResponse addTrackingEvent(String shipmentId, AddTrackingEventRequest req);
}
