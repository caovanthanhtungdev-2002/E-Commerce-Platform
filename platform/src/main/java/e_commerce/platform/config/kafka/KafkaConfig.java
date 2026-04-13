package e_commerce.platform.config.kafka;

import org.apache.kafka.clients.admin.NewTopic;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class KafkaConfig {

    @Bean
    public NewTopic orderTopic() {
        return new NewTopic("order-topic", 1, (short) 1);
    }

    @Bean
    public NewTopic paymentTopic() {
        return new NewTopic("payment-topic", 1, (short) 1);
    }

    @Bean
    public NewTopic inventoryTopic() {
        return new NewTopic("inventory-topic", 1, (short) 1);
    }
}