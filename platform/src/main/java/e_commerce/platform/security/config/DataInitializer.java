package e_commerce.platform.security.config;

import e_commerce.platform.modules.auth.enums.Role;
import e_commerce.platform.modules.auth.enums.UserStatus;
import e_commerce.platform.modules.user.entity.User;
import e_commerce.platform.modules.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements ApplicationRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.root.username}")
    private String rootUsername;

    @Value("${app.root.password}")
    private String rootPassword;

    @Value("${app.root.email}")
    private String rootEmail;

    @Override
    public void run(ApplicationArguments args) {
        if (userRepository.existsByRole(Role.ROOT)) {
            log.info(">>> ROOT account already exists, skipping...");
            return;
        }

        User root = User.builder()
                .username(rootUsername)
                .password(passwordEncoder.encode(rootPassword))
                .email(rootEmail)
                .fullName("System Root")
                .role(Role.ROOT)
                .enabled(true)
                .status(UserStatus.ACTIVE)
                .build();

        userRepository.save(root);
        log.info(">>> ROOT account initialized successfully");
    }
}