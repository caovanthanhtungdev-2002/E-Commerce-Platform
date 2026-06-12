
package e_commerce.platform.modules.product.entity;

import e_commerce.platform.modules.category.entity.Category;
import jakarta.persistence.*;
import lombok.*;

import java.util.List;
import java.time.LocalDateTime;
import java.util.ArrayList;

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

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private Double price;

    private String imageUrl;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private ProductStatus status = ProductStatus.ACTIVE;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private Category category;

    private Double avgRating;

    @Builder.Default
    private Long reviewCount = 0L;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    private String createdBy;

    private String updatedBy;

    
@OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true)
@OrderBy("sortOrder ASC")
private List<ProductImage> images = new ArrayList<>();
}