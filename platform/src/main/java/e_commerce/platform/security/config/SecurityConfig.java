package e_commerce.platform.security.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import e_commerce.platform.security.handler.CustomAccessDeniedHandler;
import e_commerce.platform.security.handler.CustomAuthenticationEntryPoint;
import e_commerce.platform.security.jwt.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;

@Configuration
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final CustomAuthenticationEntryPoint authenticationEntryPoint;
    private final CustomAccessDeniedHandler accessDeniedHandler;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

        http
            .cors(cors -> {})
            .csrf(csrf -> csrf.disable())

            .exceptionHandling(ex -> ex
                    .authenticationEntryPoint(authenticationEntryPoint)
                    .accessDeniedHandler(accessDeniedHandler)
            )

            .sessionManagement(session -> session
                    .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )

            .authorizeHttpRequests(auth -> auth

                    // PREFLIGHT
                    .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                    
                    //WebSocket
                    .requestMatchers("/ws/**").permitAll()

                    // Public API
                    .requestMatchers("/api/auth/**").permitAll()

                    // Swagger
                    .requestMatchers(
                        "/swagger-ui/**",
                        "/v3/api-docs/**",
                        "/v3/api-docs",
                        "/swagger-resources/**",
                        "/webjars/**"
                    ).permitAll()

                  
                    .requestMatchers(HttpMethod.GET, "/api/categories/**").permitAll()
                    .requestMatchers(HttpMethod.GET, "/api/products/**").permitAll()
                    .requestMatchers(HttpMethod.GET, "/api/cart").permitAll()
                    .requestMatchers(HttpMethod.POST, "/api/products/search").permitAll()

                    // Admin + Root
.requestMatchers("/api/admin/**")
.hasAnyRole("ADMIN", "ROOT")

.requestMatchers(HttpMethod.POST, "/api/products/**")
.hasAnyRole("ADMIN", "ROOT")

.requestMatchers(HttpMethod.PUT, "/api/products/**")
.hasAnyRole("ADMIN", "ROOT")

.requestMatchers(HttpMethod.DELETE, "/api/products/**")
.hasAnyRole("ADMIN", "ROOT")

// User
.requestMatchers("/api/user/**")
.hasAnyRole("USER", "ADMIN", "ROOT")

                    .anyRequest().authenticated()
            );

        http.addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    // Password encoder
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    // AuthenticationManager
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
}