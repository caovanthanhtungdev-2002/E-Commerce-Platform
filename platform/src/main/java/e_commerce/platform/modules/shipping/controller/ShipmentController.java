package e_commerce.platform.modules.shipping.controller;


import e_commerce.platform.modules.shipping.dto.request.CreateShipmentRequest;
import e_commerce.platform.modules.shipping.dto.request.UpdateShipmentStatusRequest;
import e_commerce.platform.modules.shipping.dto.request.AddTrackingEventRequest;
import e_commerce.platform.modules.shipping.dto.response.ShipmentResponse;
import e_commerce.platform.modules.shipping.dto.response.TrackingEventResponse;
import e_commerce.platform.modules.shipping.enums.ShipmentStatus;
import e_commerce.platform.modules.shipping.service.ShipmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/shipments")
@RequiredArgsConstructor
public class ShipmentController {

    private final ShipmentService shipmentService;

    /**
     * GET /api/shipments
     * Admin: danh sách đơn vận chuyển có filter + phân trang
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<Page<ShipmentResponse>> getAll(
        @RequestParam(required = false) ShipmentStatus status,
        @RequestParam(required = false) String carrier,
        @RequestParam(required = false) String search,
        @RequestParam(defaultValue = "0")  int page,
        @RequestParam(defaultValue = "15") int size,
        @RequestParam(defaultValue = "createdAt") String sortBy,
        @RequestParam(defaultValue = "desc")       String sortDir
    ) {
        Sort sort = sortDir.equalsIgnoreCase("asc")
            ? Sort.by(sortBy).ascending()
            : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);
        return ResponseEntity.ok(shipmentService.getAll(status, carrier, search, pageable));
    }

    /**
     * GET /api/shipments/{id}
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<ShipmentResponse> getById(@PathVariable String id) {
        return ResponseEntity.ok(shipmentService.getById(id));
    }

    /**
     * GET /api/shipments/order/{orderId}
     * Khách hàng hoặc admin xem theo đơn hàng
     */
    @GetMapping("/order/{orderId}")
    public ResponseEntity<ShipmentResponse> getByOrder(@PathVariable String orderId) {
        return ResponseEntity.ok(shipmentService.getByOrder(orderId));
    }

    /**
     * POST /api/shipments
     * Admin tạo đơn vận chuyển
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<ShipmentResponse> create(
        @Valid @RequestBody CreateShipmentRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(shipmentService.create(request));
    }

    /**
     * PATCH /api/shipments/{id}/status
     * Cập nhật trạng thái (PENDING→SHIPPING→DELIVERED…)
     */
    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<ShipmentResponse> updateStatus(
        @PathVariable String id,
        @Valid @RequestBody UpdateShipmentStatusRequest request
    ) {
        return ResponseEntity.ok(shipmentService.updateStatus(id, request));
    }

    /**
     * DELETE /api/shipments/{id}
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        shipmentService.delete(id);
        return ResponseEntity.noContent().build();
    }

    // ---- Tracking Events ----

    /**
     * GET /api/shipments/{shipmentId}/tracking
     */
    @GetMapping("/{shipmentId}/tracking")
    public ResponseEntity<List<TrackingEventResponse>> getTracking(
        @PathVariable String shipmentId
    ) {
        return ResponseEntity.ok(shipmentService.getTrackingEvents(shipmentId));
    }

    /**
     * POST /api/shipments/{shipmentId}/tracking
     */
    @PostMapping("/{shipmentId}/tracking")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<TrackingEventResponse> addTracking(
        @PathVariable String shipmentId,
        @Valid @RequestBody AddTrackingEventRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(shipmentService.addTrackingEvent(shipmentId, request));
    }
}
