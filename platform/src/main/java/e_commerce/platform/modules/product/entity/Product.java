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

    // private Integer stock;

    private String imageUrl;

    private boolean active;

    private boolean deleted;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    private String createdBy;
    
    private String updatedBy;
    
    //category
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private Category category;
}