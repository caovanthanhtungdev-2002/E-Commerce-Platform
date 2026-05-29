package e_commerce.platform.modules.shipping.service.impl;

import e_commerce.platform.modules.shipping.dto.request.AddTrackingEventRequest;
import e_commerce.platform.modules.shipping.dto.request.CreateShipmentRequest;
import e_commerce.platform.modules.shipping.dto.request.UpdateShipmentStatusRequest;
import e_commerce.platform.modules.shipping.dto.response.ShipmentResponse;
import e_commerce.platform.modules.shipping.dto.response.TrackingEventResponse;
import e_commerce.platform.modules.shipping.entity.Shipment;
import e_commerce.platform.modules.shipping.entity.ShippingAddress;
import e_commerce.platform.modules.shipping.entity.TrackingEvent;
import e_commerce.platform.modules.shipping.enums.ShipmentStatus;
import e_commerce.platform.exception.BusinessException;
import e_commerce.platform.exception.ResourceNotFoundException;
import e_commerce.platform.modules.shipping.mapper.ShippingMapper;
import e_commerce.platform.modules.shipping.repository.ShipmentRepository;
import e_commerce.platform.modules.shipping.repository.ShippingAddressRepository;
import e_commerce.platform.modules.shipping.repository.TrackingEventRepository;
import e_commerce.platform.modules.shipping.service.ShipmentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Service
@RequiredArgsConstructor
@Slf4j
public class ShipmentServiceImpl implements ShipmentService {

    private final ShipmentRepository        shipmentRepo;
    private final TrackingEventRepository   trackingRepo;
    private final ShippingAddressRepository addressRepo;
    private final ShippingMapper            mapper;

    private static final Map<ShipmentStatus, Set<ShipmentStatus>> TRANSITIONS = Map.of(
        ShipmentStatus.PENDING,   Set.of(ShipmentStatus.CONFIRMED, ShipmentStatus.CANCELLED),
        ShipmentStatus.CONFIRMED, Set.of(ShipmentStatus.PICKING_UP, ShipmentStatus.CANCELLED),
        ShipmentStatus.PICKING_UP,        Set.of(ShipmentStatus.IN_TRANSIT),
        ShipmentStatus.IN_TRANSIT,        Set.of(ShipmentStatus.OUT_FOR_DELIVERY, ShipmentStatus.FAILED_DELIVERY),
        ShipmentStatus.OUT_FOR_DELIVERY,  Set.of(ShipmentStatus.DELIVERED, ShipmentStatus.FAILED_DELIVERY),
        ShipmentStatus.FAILED_DELIVERY,   Set.of(ShipmentStatus.RETURNED, ShipmentStatus.OUT_FOR_DELIVERY),
        ShipmentStatus.DELIVERED,         Set.of(),
        ShipmentStatus.RETURNED,          Set.of(),
        ShipmentStatus.CANCELLED,         Set.of()
    );

    // ---- Queries ----

    @Override
    @Transactional(readOnly = true)
    public Page<ShipmentResponse> getAll(ShipmentStatus status, String carrier,
                                         String search, Pageable pageable) {
        return shipmentRepo
            .findWithFilters(status, carrier, search, pageable)
            .map(s -> mapper.toShipmentResponse(s, false));
    }

    @Override
    @Transactional(readOnly = true)
    public ShipmentResponse getById(String id) {
        return mapper.toShipmentResponse(findOrThrow(id), true);
    }

    @Override
    @Transactional(readOnly = true)
    public ShipmentResponse getByOrder(String orderId) {
        Shipment s = shipmentRepo.findByOrderId(orderId)
            .orElseThrow(() -> new ResourceNotFoundException(
                "Shipment not found for order: " + orderId));
        return mapper.toShipmentResponse(s, true);
    }

    // ---- Commands ----

    @Override
    @Transactional
    public ShipmentResponse create(CreateShipmentRequest req) {
        if (shipmentRepo.existsByTrackingNumber(req.getTrackingNumber())) {
            throw new BusinessException(
                "Tracking number already exists: " + req.getTrackingNumber());
        }

        ShippingAddress address = addressRepo.findById(req.getShippingAddressId())
            .orElseThrow(() -> new ResourceNotFoundException(
                "ShippingAddress not found: " + req.getShippingAddressId()));

        Shipment shipment = Shipment.builder()
            .orderId(req.getOrderId())
            .carrier(req.getCarrier())
            .trackingNumber(req.getTrackingNumber())
            .shippingFee(req.getShippingFee())
            .status(ShipmentStatus.PENDING)
            .shippingAddress(address)
            .note(req.getNote())
            .build();

        return mapper.toShipmentResponse(shipmentRepo.save(shipment), false);
    }

    @Override
    @Transactional
    public ShipmentResponse updateStatus(String id, UpdateShipmentStatusRequest req) {
        Shipment shipment = findOrThrow(id);
        ShipmentStatus newStatus = req.getStatus();

        Set<ShipmentStatus> allowed = TRANSITIONS.getOrDefault(
            shipment.getStatus(), Set.of());

        if (!allowed.contains(newStatus)) {
            throw new BusinessException(String.format(
                "Cannot transition from %s to %s",
                shipment.getStatus(), newStatus));
        }

        shipment.setStatus(newStatus);
        if (newStatus == ShipmentStatus.DELIVERED) {
            shipment.setDeliveredAt(LocalDateTime.now());
        }
        if (req.getNote() != null) {
            shipment.setNote(req.getNote());
        }

        return mapper.toShipmentResponse(shipmentRepo.save(shipment), false);
    }

    @Override
    @Transactional
    public void delete(String id) {
        shipmentRepo.delete(findOrThrow(id));
    }

    // ---- Tracking Events ----

    @Override
    @Transactional(readOnly = true)
    public List<TrackingEventResponse> getTrackingEvents(String shipmentId) {
        findOrThrow(shipmentId);
        return mapper.toTrackingResponseList(
            trackingRepo.findByShipmentIdOrderByEventTimeDesc(shipmentId));
    }

    @Override
    @Transactional
    public TrackingEventResponse addTrackingEvent(String shipmentId,
                                                  AddTrackingEventRequest req) {
        Shipment shipment = findOrThrow(shipmentId);

        TrackingEvent event = TrackingEvent.builder()
            .shipment(shipment)
            .status(req.getStatus())
            .location(req.getLocation())
            .description(req.getDescription())
            .eventTime(req.getEventTime())
            .build();

        return mapper.toTrackingResponse(trackingRepo.save(event));
    }

    // ---- Helpers ----

    private Shipment findOrThrow(String id) {
        return shipmentRepo.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Shipment not found: " + id));
    }
}