package e_commerce.platform.config;

import com.cloudinary.Cloudinary;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import java.util.Map;

@Configuration
public class CloudinaryConfig {

    @Bean
    public Cloudinary cloudinary() {
        return new Cloudinary(Map.of(
                "cloud_name", "dsnn5me8a",
                "api_key", "268241565362116",
                "api_secret", "zNNn5g2IOHDO7TgewaysVm9Nx0M"
        ));
    }
}