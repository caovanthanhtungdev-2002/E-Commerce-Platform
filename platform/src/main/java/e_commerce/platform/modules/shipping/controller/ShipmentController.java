package e_commerce.platform.modules.shipping.controller;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import e_commerce.platform.common.response.ApiResponse;
import e_commerce.platform.modules.shipping.dto.request.AddTrackingEventRequest;
import e_commerce.platform.modules.shipping.dto.request.CreateShipmentRequest;
import e_commerce.platform.modules.shipping.dto.request.UpdateShipmentStatusRequest;
import e_commerce.platform.modules.shipping.dto.response.ShipmentResponse;
import e_commerce.platform.modules.shipping.dto.response.TrackingEventResponse;
import e_commerce.platform.modules.shipping.enums.ShipmentStatus;
import e_commerce.platform.modules.shipping.service.ShipmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/shipments")
@RequiredArgsConstructor
public class ShipmentController {

    private final ShipmentService shipmentService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<ApiResponse<Page<ShipmentResponse>>> getAll(
        @RequestParam(required = false) ShipmentStatus status,
        @RequestParam(required = false) String carrier,
        @RequestParam(required = false) String search,
        @RequestParam(defaultValue = "0")           int page,
        @RequestParam(defaultValue = "15")          int size,
        @RequestParam(defaultValue = "createdAt")   String sortBy,
        @RequestParam(defaultValue = "desc")        String sortDir
    ) {
        Sort sort = sortDir.equalsIgnoreCase("asc")
            ? Sort.by(sortBy).ascending()
            : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);
        return ResponseEntity.ok(
            ApiResponse.success("Success", shipmentService.getAll(status, carrier, search, pageable))
        );
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<ApiResponse<ShipmentResponse>> getById(@PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.success("Success", shipmentService.getById(id)));
    }

    @GetMapping("/order/{orderId}")
    public ResponseEntity<ApiResponse<ShipmentResponse>> getByOrder(@PathVariable String orderId) {
        return ResponseEntity.ok(ApiResponse.success("Success", shipmentService.getByOrder(orderId)));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<ApiResponse<ShipmentResponse>> create(
        @Valid @RequestBody CreateShipmentRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.success("Shipment created", shipmentService.create(request)));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<ApiResponse<ShipmentResponse>> updateStatus(
        @PathVariable String id,
        @Valid @RequestBody UpdateShipmentStatusRequest request
    ) {
        return ResponseEntity.ok(
            ApiResponse.success("Status updated", shipmentService.updateStatus(id, request))
        );
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        shipmentService.delete(id);
        return ResponseEntity.noContent().build(); // 204 — không cần wrap
    }

    // ---- Tracking Events ----

    @GetMapping("/{shipmentId}/tracking")
    public ResponseEntity<ApiResponse<List<TrackingEventResponse>>> getTracking(
        @PathVariable String shipmentId
    ) {
        return ResponseEntity.ok(
            ApiResponse.success("Success", shipmentService.getTrackingEvents(shipmentId))
        );
    }

    @PostMapping("/{shipmentId}/tracking")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<ApiResponse<TrackingEventResponse>> addTracking(
        @PathVariable String shipmentId,
        @Valid @RequestBody AddTrackingEventRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.success("Tracking event added",
                shipmentService.addTrackingEvent(shipmentId, request)));
    }
}