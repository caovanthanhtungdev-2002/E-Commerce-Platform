package e_commerce.platform.payment.controller;

import e_commerce.platform.common.response.ApiResponse;
import e_commerce.platform.payment.dto.response.CreatePaymentResponse;
import e_commerce.platform.payment.service.PaymentService;

import lombok.RequiredArgsConstructor;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping("/{orderId}")
    public ApiResponse<CreatePaymentResponse> create(@PathVariable Long orderId) {

        return new ApiResponse<>(
                true,
                "Payment created",
                paymentService.createPayment(orderId)
        );
    }

    //CALLBACK
    @GetMapping("/callback")
    public String callback(
            @RequestParam String transactionId,
            @RequestParam boolean success
    ) {

        paymentService.handleCallback(transactionId, success);

        return "OK";
    }
}