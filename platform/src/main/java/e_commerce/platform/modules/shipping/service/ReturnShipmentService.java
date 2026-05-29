package e_commerce.platform.modules.shipping.service;

import e_commerce.platform.modules.shipping.dto.request.CreateReturnRequest;
import e_commerce.platform.modules.shipping.dto.request.UpdateReturnStatusRequest;
import e_commerce.platform.modules.shipping.dto.response.ReturnShipmentResponse;
import e_commerce.platform.modules.shipping.enums.ReturnStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ReturnShipmentService {

    Page<ReturnShipmentResponse> getAll(ReturnStatus status, Pageable pageable);

    ReturnShipmentResponse getById(String id);

    ReturnShipmentResponse create(CreateReturnRequest req);

    ReturnShipmentResponse updateStatus(String id, UpdateReturnStatusRequest req);
}