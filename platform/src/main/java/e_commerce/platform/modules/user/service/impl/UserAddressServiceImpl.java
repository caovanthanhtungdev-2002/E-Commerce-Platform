package e_commerce.platform.modules.user.service.impl;

import e_commerce.platform.exception.BadRequestException;
import e_commerce.platform.exception.ResourceNotFoundException;
import e_commerce.platform.modules.user.dto.request.CreateAddressRequest;
import e_commerce.platform.modules.user.service.UserAddressService;
import e_commerce.platform.modules.user.dto.response.AddressResponse;
import e_commerce.platform.modules.user.entity.User;
import e_commerce.platform.modules.user.entity.UserAddress;
import e_commerce.platform.modules.user.mapper.UserAddressMapper;
import e_commerce.platform.modules.user.repository.UserAddressRepository;
import e_commerce.platform.modules.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class UserAddressServiceImpl implements UserAddressService {

    private final UserAddressRepository addressRepository;
    private final UserRepository userRepository;

    private static final int MAX_ADDRESSES = 10;

    @Override
    public List<AddressResponse> getAddresses(String username) {
        User user = getUser(username);
        return addressRepository
                .findByUserIdOrderByIsDefaultDescCreatedAtDesc(user.getId())
                .stream()
                .map(UserAddressMapper::toResponse)
                .toList();
    }

    @Override
    public AddressResponse addAddress(String username, CreateAddressRequest request) {
        User user = getUser(username);

        int count = addressRepository.countByUserId(user.getId());

        if (count >= MAX_ADDRESSES) {
            throw new BadRequestException("Tối đa " + MAX_ADDRESSES + " địa chỉ");
        }

        boolean isFirst = count == 0;
        boolean shouldBeDefault = Boolean.TRUE.equals(request.getIsDefault()) || isFirst;

        if (shouldBeDefault) {
            addressRepository.resetDefaultByUserId(user.getId());
        }

        UserAddress address = UserAddress.builder()
                .user(user)
                .receiverName(request.getReceiverName())
                .receiverPhone(request.getReceiverPhone())
                .addressLine(request.getAddressLine())
                .ward(request.getWard())
                .district(request.getDistrict())
                .province(request.getProvince())
                .postalCode(request.getPostalCode())
                .country(request.getCountry())
                .isDefault(shouldBeDefault)
                .build();

        return UserAddressMapper.toResponse(addressRepository.save(address));
    }

    @Override
    public AddressResponse updateAddress(String username, Long addressId, CreateAddressRequest request) {
        User user = getUser(username);

        UserAddress address = addressRepository.findByIdAndUserId(addressId, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Địa chỉ không tồn tại"));

        if (Boolean.TRUE.equals(request.getIsDefault()) && !Boolean.TRUE.equals(address.getIsDefault())) {
            addressRepository.resetDefaultByUserId(user.getId());
        }

        address.setReceiverName(request.getReceiverName());
        address.setReceiverPhone(request.getReceiverPhone());
        address.setAddressLine(request.getAddressLine());
        address.setWard(request.getWard());
        address.setDistrict(request.getDistrict());
        address.setProvince(request.getProvince());
        address.setPostalCode(request.getPostalCode());
        address.setCountry(request.getCountry());
        address.setIsDefault(request.getIsDefault());

        return UserAddressMapper.toResponse(addressRepository.save(address));
    }

    @Override
    public void deleteAddress(String username, Long addressId) {
        User user = getUser(username);

        UserAddress address = addressRepository.findByIdAndUserId(addressId, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Địa chỉ không tồn tại"));

        if (Boolean.TRUE.equals(address.getIsDefault())) {
            addressRepository.delete(address);
            addressRepository.flush();

            addressRepository.findByUserIdOrderByIsDefaultDescCreatedAtDesc(user.getId())
                    .stream().findFirst()
                    .ifPresent(first -> {
                        first.setIsDefault(true);
                        addressRepository.save(first);
                    });
        } else {
            addressRepository.delete(address);
        }
    }

    @Override
    public void setDefault(String username, Long addressId) {
        User user = getUser(username);

        UserAddress address = addressRepository.findByIdAndUserId(addressId, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Địa chỉ không tồn tại"));

        addressRepository.resetDefaultByUserId(user.getId());
        address.setIsDefault(true);
        addressRepository.save(address);
    }

    private User getUser(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }
}