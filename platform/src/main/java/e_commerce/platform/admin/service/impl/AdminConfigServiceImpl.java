package e_commerce.platform.admin.service.impl;

import e_commerce.platform.admin.service.AdminConfigService;

import e_commerce.platform.modules.config.entity.SystemConfig;
import e_commerce.platform.modules.config.repository.SystemConfigRepository;

import e_commerce.platform.exception.ResourceNotFoundException;
import e_commerce.platform.exception.BadRequestException;

import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class AdminConfigServiceImpl implements AdminConfigService {

    private final SystemConfigRepository configRepository;

    // ================= GET ONE =================
    @Override
    public String getConfig(String key) {

        validateKey(key);

        return configRepository.findById(key)
                .map(SystemConfig::getConfigValue)
                .orElseThrow(() -> new ResourceNotFoundException("Config not found"));
    }

    // ================= GET ALL =================
    @Override
    public Map<String, String> getAllConfigs() {

        return configRepository.findAll()
                .stream()
                .collect(Collectors.toMap(
                        SystemConfig::getConfigKey,
                        SystemConfig::getConfigValue
                ));
    }

    // ================= UPDATE / UPSERT =================
    @Override
    public void updateConfig(String key, String value) {

        validateKey(key);
        validateValue(value);

        SystemConfig config = configRepository.findById(key)
                .orElse(
                        SystemConfig.builder()
                                .configKey(key)
                                .build()
                );

        config.setConfigValue(value);

        configRepository.save(config);
    }

    // ================= DELETE =================
    @Override
    public void deleteConfig(String key) {

        validateKey(key);

        if (!configRepository.existsById(key)) {
            throw new ResourceNotFoundException("Config not found");
        }

        configRepository.deleteById(key);
    }

    // ================= PRIVATE =================
    private void validateKey(String key) {

        if (key == null || key.isBlank()) {
            throw new BadRequestException("Config key is required");
        }
    }

    private void validateValue(String value) {

        if (value == null || value.isBlank()) {
            throw new BadRequestException("Config value is required");
        }
    }
}