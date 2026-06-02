package e_commerce.platform.modules.auth.oauth2;

import java.util.Map;

public class FacebookOAuth2UserInfo implements OAuth2UserInfo {

    private final Map<String, Object> attributes;

    public FacebookOAuth2UserInfo(Map<String, Object> attributes) {
        this.attributes = attributes;
    }

    @Override public String getId()       { return (String) attributes.get("id"); }
    @Override public String getName()     { return (String) attributes.get("name"); }
    @Override
    public String getEmail() {
        // Facebook đôi khi không trả email nếu user chưa verify
        return (String) attributes.getOrDefault("email", null);
    }
    @Override
    public String getAvatar() {
        // Facebook trả picture dạng nested object
        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> picture = (Map<String, Object>) attributes.get("picture");
            @SuppressWarnings("unchecked")
            Map<String, Object> data = (Map<String, Object>) picture.get("data");
            return (String) data.get("url");
        } catch (Exception e) {
            return null;
        }
    }
    @Override public String getProvider() { return "facebook"; }
}