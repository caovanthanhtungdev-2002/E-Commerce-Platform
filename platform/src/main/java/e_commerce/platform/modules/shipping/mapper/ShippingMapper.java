package e_commerce.platform.modules.shipping.mapper;

import e_commerce.platform.modules.shipping.dto.response.ReturnItemResponse;
import e_commerce.platform.modules.shipping.dto.response.ReturnShipmentResponse;
import e_commerce.platform.modules.shipping.dto.response.ShipmentResponse;
import e_commerce.platform.modules.shipping.dto.response.ShippingAddressResponse;
import e_commerce.platform.modules.shipping.dto.response.TrackingEventResponse;
import e_commerce.platform.modules.shipping.entity.ReturnItem;
import e_commerce.platform.modules.shipping.entity.ReturnShipment;
import e_commerce.platform.modules.shipping.entity.Shipment;
import e_commerce.platform.modules.shipping.entity.ShippingAddress;
import e_commerce.platform.modules.shipping.entity.TrackingEvent;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class ShippingMapper {

    // ---- ShippingAddress ----

    public ShippingAddressResponse toAddressResponse(ShippingAddress a) {
        if (a == null) return null;
        return ShippingAddressResponse.builder()
            .id(a.getId())
            .receiverName(a.getReceiverName())
            .receiverPhone(a.getReceiverPhone())
            .addressLine(a.getAddressLine())
            .ward(a.getWard())
            .district(a.getDistrict())
            .province(a.getProvince())
            .country(a.getCountry())
            .note(a.getNote())
            .createdAt(a.getCreatedAt())
            .updatedAt(a.getUpdatedAt())
            .build();
    }

    // ---- TrackingEvent ----

    public TrackingEventResponse toTrackingResponse(TrackingEvent e) {
        return TrackingEventResponse.builder()
            .id(e.getId())
            .shipmentId(e.getShipment().getId())
            .status(e.getStatus())
            .location(e.getLocation())
            .description(e.getDescription())
            .eventTime(e.getEventTime())
            .createdAt(e.getCreatedAt())
            .build();
    }

    public List<TrackingEventResponse> toTrackingResponseList(List<TrackingEvent> events) {
        if (events == null) return Collections.emptyList();
        return events.stream()
            .map(this::toTrackingResponse)
            .collect(Collectors.toList());
    }

    // ---- Shipment ----

    public ShipmentResponse toShipmentResponse(Shipment s, boolean includeEvents) {
        return ShipmentResponse.builder()
            .id(s.getId())
            .orderId(s.getOrderId())
            .carrier(s.getCarrier())
            .trackingNumber(s.getTrackingNumber())
            .status(s.getStatus())
            .shippingFee(s.getShippingFee())
            .deliveredAt(s.getDeliveredAt())
            .note(s.getNote())
            .shippingAddressId(
                s.getShippingAddress() != null ? s.getShippingAddress().getId() : null
            )
            .shippingAddress(toAddressResponse(s.getShippingAddress()))
            .trackingEvents(
                includeEvents ? toTrackingResponseList(s.getTrackingEvents()) : null
            )
            .createdAt(s.getCreatedAt())
            .updatedAt(s.getUpdatedAt())
            .build();
    }

    // ---- ReturnItem ----

    public ReturnItemResponse toReturnItemResponse(ReturnItem ri) {
        return ReturnItemResponse.builder()
            .id(ri.getId())
            .returnId(ri.getReturnShipment().getId())
            .orderItemId(ri.getOrderItemId())
            .quantity(ri.getQuantity())
            .reason(ri.getReason())
            .createdAt(ri.getCreatedAt())
            .build();
    }

    // ---- ReturnShipment ----

    public ReturnShipmentResponse toReturnResponse(ReturnShipment r) {
        List<ReturnItemResponse> items = r.getReturnItems() == null
            ? Collections.emptyList()
            : r.getReturnItems().stream()
                .map(this::toReturnItemResponse)
                .collect(Collectors.toList());

        return ReturnShipmentResponse.builder()
            .id(r.getId())
            .orderId(r.getOrderId())
            .reason(r.getReason())
            .status(r.getStatus())
            .refundAmount(r.getRefundAmount())
            .carrier(r.getCarrier())
            .trackingNumber(r.getTrackingNumber())
            .note(r.getNote())
            .returnItems(items)
            .createdAt(r.getCreatedAt())
            .updatedAt(r.getUpdatedAt())
            .build();
    }
}