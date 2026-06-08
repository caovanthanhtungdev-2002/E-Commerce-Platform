package e_commerce.platform.config;

import e_commerce.platform.modules.shipping.entity.ShippingFeeConfig;
import e_commerce.platform.modules.shipping.repository.ShippingFeeConfigRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@Order(2) 
@RequiredArgsConstructor
public class ShippingFeeDataInitializer implements ApplicationRunner {

    private final ShippingFeeConfigRepository repo;

    @Override
    public void run(ApplicationArguments args) {
        if (repo.count() > 0) return;

        repo.saveAll(List.of(
            ShippingFeeConfig.builder().region("NORTH").fee(25_000.0).build(),
            ShippingFeeConfig.builder().region("CENTRAL").fee(30_000.0).build(),
            ShippingFeeConfig.builder().region("SOUTH").fee(35_000.0).build()
        ));
    }
}