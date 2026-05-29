package e_commerce.platform.modules.review.controller;

import e_commerce.platform.common.response.ApiResponse;
import e_commerce.platform.modules.review.dto.request.CreateReviewRequest;
import e_commerce.platform.modules.review.dto.response.ReviewResponse;
import e_commerce.platform.modules.review.service.ReviewService;

import e_commerce.platform.exception.BadRequestException;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;

import e_commerce.platform.modules.review.dto.response.ReviewSummaryResponse;


@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    @PostMapping
    public ApiResponse<?> create(
            Authentication auth,
            @Valid @RequestBody CreateReviewRequest request
    ) {
       if (auth == null || !auth.isAuthenticated()) {
    throw new BadRequestException("Unauthorized");
}
        reviewService.createReview(auth.getName(), request);
        return new ApiResponse<>(true, "Reviewed", null);
    }

   @GetMapping("/{productId}")
public ApiResponse<Page<ReviewResponse>> getByProduct(
        @PathVariable Long productId,
        @PageableDefault(size = 5) Pageable pageable
) {
    return new ApiResponse<>(
            true,
            "Success",
            reviewService.getByProduct(productId, pageable)
    );
}

@GetMapping("/{productId}/summary")
public ApiResponse<ReviewSummaryResponse> getSummary(@PathVariable Long productId) {
    return new ApiResponse<>(
            true,
            "Success",
            reviewService.getSummary(productId)
    );
}

@PostMapping("/{id}/like")
public ApiResponse<?> like(@PathVariable Long id) {
    reviewService.likeReview(id);
    return new ApiResponse<>(true, "OK", null);
}

}