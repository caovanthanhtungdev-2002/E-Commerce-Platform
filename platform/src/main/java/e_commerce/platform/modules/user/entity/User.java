package e_commerce.platform.modules.user.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import e_commerce.platform.modules.auth.enums.Gender;
import e_commerce.platform.modules.auth.enums.Role;
import e_commerce.platform.modules.auth.enums.UserStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

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
    private Gender gender;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    private String avatar;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private UserStatus status = UserStatus.ACTIVE;

    @Column(nullable = false)
    @Builder.Default
    private boolean enabled = true; 

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    private LocalDateTime lastLoginAt;

    @PrePersist
public void prePersist() {
    this.createdAt = LocalDateTime.now();
this.updatedAt = LocalDateTime.now();
}

@PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

@OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
@JsonIgnoreProperties("user")
private List<UserAddress> addresses = new ArrayList<>();

@Column(length = 500)
private String bio;

@OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
@Builder.Default
private List<UserSession> sessions = new ArrayList<>();


}