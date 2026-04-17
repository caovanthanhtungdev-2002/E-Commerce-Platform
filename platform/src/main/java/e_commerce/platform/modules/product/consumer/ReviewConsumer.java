package e_commerce.platform.modules.product.consumer;

import e_commerce.platform.modules.review.event.ReviewEvent;
import lombok.RequiredArgsConstructor;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;
import e_commerce.platform.modules.product.service.ProductService;

@Service
@RequiredArgsConstructor
public class ReviewConsumer {

    private final ProductService productService;

    @KafkaListener(topics = "review-topic", groupId = "product-group")
    public void handle(ReviewEvent event) {
        productService.updateRating(event.getProductId());
    }
}
