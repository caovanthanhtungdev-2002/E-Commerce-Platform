package e_commerce.platform.modules.review.dto.response;

import java.io.Serializable;
import java.util.Map;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ReviewSummaryResponse implements Serializable {
    private Double avgRating;
    private Long totalReviews;
    private Map<Integer, Long> starCounts; // { 1: 0, 2: 1, 3: 0, 4: 0, 5: 0 }
}