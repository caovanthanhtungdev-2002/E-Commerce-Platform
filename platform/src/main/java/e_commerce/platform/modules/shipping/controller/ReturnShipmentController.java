package e_commerce.platform.modules.shipping.controller;

import e_commerce.platform.common.response.ApiResponse;
import e_commerce.platform.modules.shipping.dto.request.CreateReturnRequest;
import e_commerce.platform.modules.shipping.dto.request.UpdateReturnStatusRequest;
import e_commerce.platform.modules.shipping.dto.response.ReturnShipmentResponse;
import e_commerce.platform.modules.shipping.enums.ReturnStatus;
import e_commerce.platform.modules.shipping.service.ReturnShipmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
 
@RestController
@RequestMapping("/api/returns")
@RequiredArgsConstructor
public class ReturnShipmentController {
 
    private final ReturnShipmentService returnService;
 
    /**
     * GET /api/returns
     */
    @GetMapping
@PreAuthorize("hasAnyRole('ADMIN', 'STAFF','ROOT')")
public ResponseEntity<ApiResponse<Page<ReturnShipmentResponse>>> getAll(  
    @RequestParam(required = false) ReturnStatus status,
    @RequestParam(defaultValue = "0")  int page,
    @RequestParam(defaultValue = "15") int size
) {
    Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
    return ResponseEntity.ok(new ApiResponse<>(true, "Success", returnService.getAll(status, pageable)));
}
 
    /**
     * GET /api/returns/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<ReturnShipmentResponse> getById(@PathVariable String id) {
        return ResponseEntity.ok(returnService.getById(id));
    }
 
    /**
     * POST /api/returns
     * Khách hàng gửi yêu cầu hoàn hàng
     */
    @PostMapping
    public ResponseEntity<ReturnShipmentResponse> create(
        @Valid @RequestBody CreateReturnRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(returnService.create(request));
    }
 
    /**
     * PATCH /api/returns/{id}/status
     * Admin duyệt / từ chối / hoàn thành
     */
    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF','ROOT')")
    public ResponseEntity<ReturnShipmentResponse> updateStatus(
        @PathVariable String id,
        @Valid @RequestBody UpdateReturnStatusRequest request
    ) {
        return ResponseEntity.ok(returnService.updateStatus(id, request));
    }
}