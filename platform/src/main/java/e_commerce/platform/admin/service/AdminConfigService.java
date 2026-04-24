package e_commerce.platform.admin.service;

import java.util.Map;

public interface AdminConfigService {

    String getConfig(String key);

    Map<String, String> getAllConfigs();

    void updateConfig(String key, String value);

    void deleteConfig(String key);
}