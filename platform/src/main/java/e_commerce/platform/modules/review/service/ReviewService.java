package e_commerce.platform.modules.review.service;

import e_commerce.platform.modules.review.dto.request.CreateReviewRequest;

import e_commerce.platform.modules.review.dto.response.ReviewResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import e_commerce.platform.modules.review.dto.response.ReviewSummaryResponse;

public interface ReviewService {

    // method 
    void createReview(String username, CreateReviewRequest request);

    ReviewSummaryResponse getSummary(Long productId);

    Page<ReviewResponse> getByProduct(Long productId, Pageable pageable);
}