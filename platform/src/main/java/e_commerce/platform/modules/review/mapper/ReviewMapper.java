package e_commerce.platform.modules.review.mapper;

import e_commerce.platform.modules.review.dto.response.ReviewResponse;
import e_commerce.platform.modules.review.entity.Review;

public class ReviewMapper {

    public static ReviewResponse toResponse(Review review) {
        return ReviewResponse.builder()
                .id(review.getId())
                .username(review.getUsername())
                .rating(review.getRating())
                .comment(review.getComment())
                .helpfulCount(review.getHelpfulCount() != null ? review.getHelpfulCount() : 0)
                .imageUrl(review.getImageUrl())
                .createdAt(review.getCreatedAt())
                .build();
    }
}