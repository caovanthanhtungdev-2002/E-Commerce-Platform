package e_commerce.platform.modules.product.entity;

import jakarta.persistence.*;
import lombok.*;
import e_commerce.platform.modules.category.entity.Category;
import java.time.LocalDateTime;

@Entity
@Table(name = "products")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    private String description;

    @Column(nullable = false)
    private Double price;

    private String imageUrl;

    @Builder.Default
private boolean active = true;

@Builder.Default
private boolean deleted = false;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    private String createdBy;
    
    private String updatedBy;
    
    //category
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private Category category;

    private Double avgRating;
    private Long reviewCount;
}