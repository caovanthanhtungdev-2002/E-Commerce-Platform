package e_commerce.platform.modules.user.mapper;

import e_commerce.platform.modules.user.dto.response.AddressResponse;
import e_commerce.platform.modules.user.entity.UserAddress;

public class UserAddressMapper {

    public static AddressResponse toResponse(UserAddress address) {
        return AddressResponse.builder()
                .id(address.getId())
                .receiverName(address.getReceiverName())
                .receiverPhone(address.getReceiverPhone())
                .addressLine(address.getAddressLine())
                .ward(address.getWard())
                .district(address.getDistrict())
                .province(address.getProvince())
                .postalCode(address.getPostalCode())
                .isDefault(address.getIsDefault())
                .createdAt(address.getCreatedAt())
                .country(address.getCountry())
                .build();
    }
}