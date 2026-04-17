package e_commerce.platform.modules.review.event;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReviewEvent {

    private Long productId;
    private Integer rating;
}