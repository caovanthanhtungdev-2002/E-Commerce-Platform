package e_commerce.platform.modules.user.controller;
import e_commerce.platform.common.response.ApiResponse;
import e_commerce.platform.modules.user.dto.request.CreateAddressRequest;
import e_commerce.platform.modules.user.dto.response.AddressResponse;
import e_commerce.platform.modules.user.service.UserAddressService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/user/addresses")
@RequiredArgsConstructor
public class UserAddressController {

    private final UserAddressService addressService;

    @GetMapping
    public ApiResponse<List<AddressResponse>> getAddresses(Authentication auth) {
        return new ApiResponse<>(true, "Success",
                addressService.getAddresses(auth.getName()));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<AddressResponse>> addAddress(
            @Valid @RequestBody CreateAddressRequest request,
            Authentication auth) {
        return ResponseEntity.status(HttpStatus.CREATED).body(
                new ApiResponse<>(true, "Address added",
                        addressService.addAddress(auth.getName(), request)));
    }

    @PutMapping("/{id}")
    public ApiResponse<AddressResponse> updateAddress(
            @PathVariable Long id,
            @Valid @RequestBody CreateAddressRequest request,
            Authentication auth) {
        return new ApiResponse<>(true, "Updated",
                addressService.updateAddress(auth.getName(), id, request));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteAddress(
            @PathVariable Long id,
            Authentication auth) {
        addressService.deleteAddress(auth.getName(), id);
        return new ApiResponse<>(true, "Deleted", null);
    }

    @PatchMapping("/{id}/default")
    public ApiResponse<Void> setDefault(
            @PathVariable Long id,
            Authentication auth) {
        addressService.setDefault(auth.getName(), id);
        return new ApiResponse<>(true, "Default address updated", null);
    }
}