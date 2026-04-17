package e_commerce.platform.modules.review.producer;

import lombok.RequiredArgsConstructor;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

import e_commerce.platform.modules.review.event.ReviewEvent;

@Service
@RequiredArgsConstructor
public class ReviewProducer {

    private final KafkaTemplate<String, Object> kafkaTemplate;

    public void send(ReviewEvent event) {
        kafkaTemplate.send("review-topic", event);
    }
}