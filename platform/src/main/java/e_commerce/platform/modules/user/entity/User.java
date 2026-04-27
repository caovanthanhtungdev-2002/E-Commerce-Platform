package e_commerce.platform.modules.user.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import e_commerce.platform.modules.auth.enums.Role;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String username;

    @Column(nullable = false)
    @JsonIgnore
    private String password;

    @Column(unique = true, nullable = false)
    private String email;

    private String fullName;

    @Column(unique = true, nullable = false)
    private String phone;

    @Enumerated(EnumType.STRING)
    private Role role;

    private String avatar;

    private String status;

    @Column(nullable = false)
    @Builder.Default
    private boolean enabled = true; 

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
public void prePersist() {
    this.createdAt = LocalDateTime.now();
}
}