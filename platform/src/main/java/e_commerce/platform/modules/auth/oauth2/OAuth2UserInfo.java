package e_commerce.platform.modules.auth.oauth2;

public interface OAuth2UserInfo {
    String getId();
    String getName();
    String getEmail();
    String getAvatar();
    String getProvider();
}