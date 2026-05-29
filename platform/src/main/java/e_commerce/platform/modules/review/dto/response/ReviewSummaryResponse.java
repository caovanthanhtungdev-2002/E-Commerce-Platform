package e_commerce.platform.modules.review.dto.response;

import java.io.Serializable;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ReviewSummaryResponse implements Serializable {
    private Double avgRating;
    private Long totalReviews;
}