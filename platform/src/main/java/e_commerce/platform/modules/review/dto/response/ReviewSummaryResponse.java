package e_commerce.platform.modules.review.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ReviewSummaryResponse {
    private Double avgRating;
    private Long totalReviews;
}