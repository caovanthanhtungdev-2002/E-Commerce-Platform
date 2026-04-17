package e_commerce.platform.modules.review.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.time.LocalDateTime;

@Table(
    name = "reviews",
    indexes = {
        @Index(name = "idx_product_id", columnList = "productId")
    },
    uniqueConstraints = {
        @UniqueConstraint(columnNames = {"userId", "productId"})
    }
)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Review {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long userId;

    private String username;

    private Long productId;

    private Integer rating;

    @Size(max = 1000)
    private String comment;

    private String imageUrl;

    private LocalDateTime createdAt;
}