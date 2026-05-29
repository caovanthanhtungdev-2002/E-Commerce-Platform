package e_commerce.platform.modules.shipping.service.impl;

import e_commerce.platform.modules.shipping.dto.request.CreateReturnRequest;
import e_commerce.platform.modules.shipping.dto.request.UpdateReturnStatusRequest;
import e_commerce.platform.modules.shipping.dto.response.ReturnShipmentResponse;
import e_commerce.platform.modules.shipping.entity.ReturnItem;
import e_commerce.platform.modules.shipping.entity.ReturnShipment;
import e_commerce.platform.modules.shipping.enums.ReturnStatus;
import e_commerce.platform.exception.BusinessException;
import e_commerce.platform.exception.ResourceNotFoundException;
import e_commerce.platform.modules.shipping.mapper.ShippingMapper;
import e_commerce.platform.modules.shipping.repository.ReturnShipmentRepository;
import e_commerce.platform.modules.shipping.service.ReturnShipmentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReturnShipmentServiceImpl implements ReturnShipmentService {

    private final ReturnShipmentRepository returnRepo;
    private final ShippingMapper           mapper;

    private static final Map<ReturnStatus, Set<ReturnStatus>> TRANSITIONS = Map.of(
        ReturnStatus.PENDING,    Set.of(ReturnStatus.APPROVED, ReturnStatus.REJECTED),
        ReturnStatus.APPROVED,   Set.of(ReturnStatus.PROCESSING, ReturnStatus.CANCELLED),
        ReturnStatus.PROCESSING, Set.of(ReturnStatus.COMPLETED),
        ReturnStatus.REJECTED,   Set.of(),
        ReturnStatus.COMPLETED,  Set.of(),
        ReturnStatus.CANCELLED,  Set.of()
    );

    // ---- Queries ----

    @Override
    @Transactional(readOnly = true)
    public Page<ReturnShipmentResponse> getAll(ReturnStatus status, Pageable pageable) {
        return returnRepo.findWithFilters(status, pageable)
            .map(mapper::toReturnResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public ReturnShipmentResponse getById(String id) {
        return mapper.toReturnResponse(findOrThrow(id));
    }

    // ---- Commands ----

    @Override
    @Transactional
    public ReturnShipmentResponse create(CreateReturnRequest req) {
        if (returnRepo.existsByOrderId(req.getOrderId())) {
            throw new BusinessException(
                "A return request already exists for order: " + req.getOrderId());
        }

        ReturnShipment returnShipment = ReturnShipment.builder()
            .orderId(req.getOrderId())
            .reason(req.getReason())
            .status(ReturnStatus.PENDING)
            .refundAmount(req.getRefundAmount())
            .build();

        List<ReturnItem> items = req.getReturnItems().stream()
            .map(ri -> ReturnItem.builder()
                .returnShipment(returnShipment)
                .orderItemId(ri.getOrderItemId())
                .quantity(ri.getQuantity())
                .reason(ri.getReason())
                .build())
            .collect(Collectors.toList());

        returnShipment.setReturnItems(items);

        return mapper.toReturnResponse(returnRepo.save(returnShipment));
    }

    @Override
    @Transactional
    public ReturnShipmentResponse updateStatus(String id, UpdateReturnStatusRequest req) {
        ReturnShipment r = findOrThrow(id);
        ReturnStatus newStatus = req.getStatus();

        Set<ReturnStatus> allowed = TRANSITIONS.getOrDefault(r.getStatus(), Set.of());
        if (!allowed.contains(newStatus)) {
            throw new BusinessException(String.format(
                "Cannot transition return from %s to %s", r.getStatus(), newStatus));
        }

        r.setStatus(newStatus);
        if (req.getNote() != null) {
            r.setNote(req.getNote());
        }

        return mapper.toReturnResponse(returnRepo.save(r));
    }

    // ---- Helpers ----

    private ReturnShipment findOrThrow(String id) {
        return returnRepo.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Return not found: " + id));
    }
}