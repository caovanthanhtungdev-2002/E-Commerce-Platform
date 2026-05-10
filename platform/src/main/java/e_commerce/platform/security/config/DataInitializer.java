package e_commerce.platform.security.config;

import e_commerce.platform.modules.auth.enums.Role;
import e_commerce.platform.modules.user.entity.User;
import e_commerce.platform.modules.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    private static final String ROOT_PASSWORD = "Thanhtung#2010#2002";
    private static final String ROOT_USERNAME = "caovanthanhtung.dev@gmail.com";

    @Override
    public void run(String... args) {

        if (userRepository.existsByUsername(ROOT_USERNAME)) {
            log.info("Root admin already exists, skipping...");
            return;
        }

        User root = User.builder()
                .username(ROOT_USERNAME)
                .password(passwordEncoder.encode(ROOT_PASSWORD))
                .email("caovanthanhtung.dev@gmail.com")
                .fullName("Root Administrator")
                .phone("0932569302")
                .role(Role.ROOT)
                .enabled(true)
                .build();

        userRepository.save(root);

        log.info("Root admin created: username={}, password={}",
                ROOT_USERNAME,
                ROOT_PASSWORD);
    }
}
