package e_commerce.platform.modules.review.service.impl;

import e_commerce.platform.exception.BadRequestException;
import e_commerce.platform.modules.order.enums.OrderStatus;
import e_commerce.platform.modules.order.repository.OrderRepository;
import e_commerce.platform.modules.review.dto.request.CreateReviewRequest;
import e_commerce.platform.modules.review.dto.response.ReviewResponse;
import e_commerce.platform.modules.review.entity.Review;
import e_commerce.platform.modules.review.mapper.ReviewMapper;
import e_commerce.platform.modules.review.repository.ReviewRepository;
import e_commerce.platform.modules.review.service.ReviewService;
import e_commerce.platform.modules.user.entity.User;
import e_commerce.platform.modules.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import e_commerce.platform.modules.review.dto.response.ReviewSummaryResponse;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.CacheEvict;

import e_commerce.platform.modules.review.producer.ReviewProducer;
import e_commerce.platform.modules.review.event.ReviewEvent;

@Service
@RequiredArgsConstructor
public class ReviewServiceImpl implements ReviewService {

    private final ReviewRepository reviewRepository;
    private final UserRepository userRepository;
    private final OrderRepository orderRepository;
    private final ReviewProducer reviewProducer;

    @Override
    @Transactional
    @CacheEvict(value = "reviewSummary", key = "#request.productId")
    public void createReview(String username, CreateReviewRequest request) {

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new BadRequestException("User not found"));

        //check đã mua (PAID)
boolean hasPurchased = orderRepository.hasPurchased(
    user.getId(),
    request.getProductId(),
    java.util.List.of(
        OrderStatus.DELIVERED,
        OrderStatus.PAID,
        OrderStatus.COMPLETED
    )
);

        if (!hasPurchased) {
            throw new BadRequestException("Bạn chưa mua sản phẩm này");
        }

        // check đã review chưa
        if (reviewRepository.existsByUserIdAndProductId(user.getId(), request.getProductId())) {
            throw new BadRequestException("Bạn đã review sản phẩm này rồi");
        }

        Review review = Review.builder()
                .userId(user.getId())
                .username(user.getUsername())
                .productId(request.getProductId())
                .rating(request.getRating())
                .comment(request.getComment())
                .createdAt(LocalDateTime.now())
                .build();

        reviewRepository.save(review);

        //SEND KAFKA
        reviewProducer.send(
        ReviewEvent.builder()
                .productId(request.getProductId())
                .rating(request.getRating())
                .build()
);
    }
@Override
@Cacheable(value = "reviewSummary", key = "#productId")
public ReviewSummaryResponse getSummary(Long productId) {

    Double avg = reviewRepository.getAverageRating(productId);
    long total = reviewRepository.countByProductId(productId);

    return new ReviewSummaryResponse(avg, total);
}

    @Override
public Page<ReviewResponse> getByProduct(Long productId, Pageable pageable) {

    return reviewRepository
            .findByProductIdOrderByCreatedAtDesc(productId, pageable)
            .map(ReviewMapper::toResponse);
}

@Override
@Transactional
public void likeReview(Long reviewId) {
    Review review = reviewRepository.findById(reviewId)
            .orElseThrow(() -> new BadRequestException("Review not found"));
    review.setHelpfulCount(
        review.getHelpfulCount() == null ? 1 : review.getHelpfulCount() + 1
    );
    reviewRepository.save(review);
}


}