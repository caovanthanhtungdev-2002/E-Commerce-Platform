package e_commerce.platform.modules.auth.entity;
import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.*;
import lombok.*;

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

    private String fullName;
    
    @Column(unique = true, nullable = false)
    private String phone ;

    @Enumerated(EnumType.STRING)
    private Role role;
    
    private String avatar;
}
