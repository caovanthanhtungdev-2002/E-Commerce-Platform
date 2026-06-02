package e_commerce.platform.modules.payment.controller;

import e_commerce.platform.common.response.ApiResponse;
import e_commerce.platform.modules.payment.dto.response.CreatePaymentResponse;
import e_commerce.platform.modules.payment.service.PaymentService;
import lombok.RequiredArgsConstructor;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    // POST /api/payments/cod/{orderId}/confirm
@PostMapping("/cod/{orderId}/confirm")
@PreAuthorize("hasRole('ADMIN') or hasRole('STAFF')")
public ResponseEntity<ApiResponse<Void>> confirmCOD(@PathVariable Long orderId) {
    paymentService.confirmCOD(orderId);
    return ResponseEntity.ok(ApiResponse.success("COD confirmed", null)); 
}

    @PostMapping("/{orderId}")
    public ApiResponse<CreatePaymentResponse> create(@PathVariable Long orderId) {

        return new ApiResponse<>(
                true,
                "Payment created",
                paymentService.createPayment(orderId)
        );
    }

    //CALLBACK
   @GetMapping("/vnpay/callback")
public String vnpayCallback(@RequestParam Map<String, String> params) {

    return paymentService.handleVNPayCallback(params);
}


    
}