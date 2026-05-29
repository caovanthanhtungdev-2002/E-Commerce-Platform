package e_commerce.platform.modules.review.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class ReviewResponse {

    private Long id;
    private String username;
    private Integer rating;
    private String comment;
    private Integer helpfulCount;
    private String imageUrl;
    private LocalDateTime createdAt;

}