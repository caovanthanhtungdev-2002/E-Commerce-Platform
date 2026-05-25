    package e_commerce.platform.modules.user.service;

    import e_commerce.platform.modules.user.dto.request.CreateAddressRequest;
    import e_commerce.platform.modules.user.dto.response.AddressResponse;

    import java.util.List;

    public interface UserAddressService {

        List<AddressResponse> getAddresses(String username);

        AddressResponse addAddress(
                String username,
                CreateAddressRequest request
        );

        AddressResponse updateAddress(
                String username,
                Long addressId,
                CreateAddressRequest request
        );

        void deleteAddress(String username, Long addressId);

        void setDefault(String username, Long addressId);
    }