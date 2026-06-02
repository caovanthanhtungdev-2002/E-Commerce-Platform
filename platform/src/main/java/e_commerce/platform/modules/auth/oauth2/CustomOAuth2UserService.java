package e_commerce.platform.modules.auth.oauth2;

import e_commerce.platform.modules.auth.enums.Role;
import e_commerce.platform.modules.auth.enums.UserStatus;
import e_commerce.platform.modules.user.entity.User;
import e_commerce.platform.modules.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserService;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class CustomOAuth2UserService implements OAuth2UserService<OAuth2UserRequest, OAuth2User> {

    private final UserRepository userRepository;
    private final DefaultOAuth2UserService delegate = new DefaultOAuth2UserService();

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {

        OAuth2User oAuth2User = delegate.loadUser(userRequest);

        String registrationId = userRequest.getClientRegistration().getRegistrationId();
        OAuth2UserInfo userInfo = OAuth2UserInfoFactory
                .getOAuth2UserInfo(registrationId, oAuth2User.getAttributes());

        // Không throw nữa — xử lý email null trong processUser
        if (userInfo.getEmail() == null) {
            log.warn("OAuth2 user không có email từ provider: {} — dùng email giả", registrationId);
        }

        User user = processUser(userInfo);

        String nameAttributeKey = userRequest.getClientRegistration()
                .getProviderDetails().getUserInfoEndpoint().getUserNameAttributeName();

        return new DefaultOAuth2User(
                Collections.emptyList(),
                mergeAttributes(oAuth2User.getAttributes(), user.getUsername()),
                nameAttributeKey
        );
    }

    private User processUser(OAuth2UserInfo userInfo) {
        // Facebook đôi khi không trả email → tạo email giả từ providerId
        String email = userInfo.getEmail() != null
                ? userInfo.getEmail()
                : userInfo.getId() + "@" + userInfo.getProvider() + ".oauth";

        return userRepository.findByEmail(email)
                .map(existing -> updateExistingUser(existing, userInfo))
                .orElseGet(() -> createNewUser(userInfo, email));
    }

    private User updateExistingUser(User user, OAuth2UserInfo userInfo) {
        if (userInfo.getAvatar() != null) {
            user.setAvatar(userInfo.getAvatar());
        }
        user.setProvider(userInfo.getProvider());
        // Cập nhật providerId — quan trọng khi user đăng ký email trước, login OAuth2 sau
        user.setProviderId(userInfo.getId());
        return userRepository.save(user);
    }

    private User createNewUser(OAuth2UserInfo userInfo, String email) {
        String baseUsername = email.split("@")[0]
                .replaceAll("[^a-zA-Z0-9_]", "_");
        String username = generateUniqueUsername(baseUsername);

        User user = User.builder()
                .username(username)
                .email(email)
                .fullName(userInfo.getName())
                .avatar(userInfo.getAvatar())
                .password("") // OAuth user không dùng password
                .provider(userInfo.getProvider())
                .providerId(userInfo.getId())
                .role(Role.USER)
                .status(UserStatus.ACTIVE)
                .build();

        log.info("Tạo OAuth2 user mới: {} từ {}", username, userInfo.getProvider());
        return userRepository.save(user);
    }

    private String generateUniqueUsername(String base) {
        String candidate = base;
        int suffix = 1;
        while (userRepository.existsByUsername(candidate)) {
            candidate = base + "_" + suffix++;
        }
        return candidate;
    }

    private Map<String, Object> mergeAttributes(Map<String, Object> original, String username) {
        Map<String, Object> merged = new HashMap<>(original);
        merged.put("app_username", username);
        return Collections.unmodifiableMap(merged);
    }
}