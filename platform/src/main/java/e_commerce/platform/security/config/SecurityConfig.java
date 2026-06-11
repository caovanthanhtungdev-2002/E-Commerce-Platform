package e_commerce.platform.security.config;

import e_commerce.platform.modules.auth.oauth2.CustomOAuth2UserService;
import e_commerce.platform.modules.auth.oauth2.OAuth2AuthenticationFailureHandler;
import e_commerce.platform.modules.auth.oauth2.OAuth2AuthenticationSuccessHandler;
import e_commerce.platform.security.handler.CustomAccessDeniedHandler;
import e_commerce.platform.security.handler.CustomAuthenticationEntryPoint;
import e_commerce.platform.security.jwt.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;
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
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;

@Configuration
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final CustomAuthenticationEntryPoint authenticationEntryPoint;
    private final CustomAccessDeniedHandler accessDeniedHandler;
    private final CustomOAuth2UserService customOAuth2UserService;
    private final OAuth2AuthenticationSuccessHandler oAuth2SuccessHandler;
    private final OAuth2AuthenticationFailureHandler oAuth2FailureHandler;
    private final CorsConfigurationSource corsConfigurationSource;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource))
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

                    // WebSocket
                    .requestMatchers("/ws/**").permitAll()

                    // Public API
                    .requestMatchers("/api/auth/**").permitAll()
                    .requestMatchers("/oauth2/**").permitAll()
                    .requestMatchers(HttpMethod.POST, "/api/coupons/apply").authenticated() 

                    // Swagger
                    .requestMatchers(
                        "/swagger-ui/**",
                        "/v3/api-docs/**",
                        "/swagger-resources/**",
                        "/webjars/**"
                    ).permitAll()

                    // Public GET
                    .requestMatchers(HttpMethod.GET, "/api/categories/**").permitAll()
                    .requestMatchers(HttpMethod.GET, "/api/products/**").permitAll()
                    .requestMatchers(HttpMethod.GET, "/api/cart").permitAll()
                    .requestMatchers(HttpMethod.POST, "/api/products/search").permitAll()

                    
                    .requestMatchers(HttpMethod.GET, "/api/admin/inventory/**")
                        .hasAnyRole("ROOT", "ADMIN", "MANAGER", "WAREHOUSE")
                    .requestMatchers(HttpMethod.PATCH, "/api/admin/inventory/**")
                        .hasAnyRole("ROOT", "ADMIN", "WAREHOUSE")

                    // Admin routes
                    .requestMatchers("/api/admin/**").hasAnyRole("ADMIN", "ROOT")
                    .requestMatchers(HttpMethod.POST,   "/api/products/**").hasAnyRole("ADMIN", "ROOT")
                    .requestMatchers(HttpMethod.PUT,    "/api/products/**").hasAnyRole("ADMIN", "ROOT")
                    .requestMatchers(HttpMethod.DELETE, "/api/products/**").hasAnyRole("ADMIN", "ROOT")

                    // Shipments
                    .requestMatchers(HttpMethod.GET,    "/api/shipments/**").authenticated()
                    .requestMatchers(HttpMethod.POST,   "/api/shipments/**").hasAnyRole("ADMIN", "ROOT")
                    .requestMatchers(HttpMethod.PATCH,  "/api/shipments/**").hasAnyRole("ADMIN", "ROOT")
                    .requestMatchers(HttpMethod.DELETE, "/api/shipments/**").hasAnyRole("ADMIN", "ROOT")

                    // Returns
                    .requestMatchers(HttpMethod.GET,   "/api/returns/**").authenticated()
                    .requestMatchers(HttpMethod.POST,  "/api/returns/**").authenticated()
                    .requestMatchers(HttpMethod.PATCH, "/api/returns/**").hasAnyRole("ADMIN", "ROOT")

                    // User
                    .requestMatchers("/api/user/**").hasAnyRole("USER", "ADMIN", "ROOT")

                    .anyRequest().authenticated()
            )
            .oauth2Login(oauth2 -> oauth2
                    .authorizationEndpoint(e -> e.baseUri("/oauth2/authorize"))
                    .redirectionEndpoint(e -> e.baseUri("/oauth2/callback/*"))
                    .userInfoEndpoint(e -> e.userService(customOAuth2UserService))
                    .successHandler(oAuth2SuccessHandler)
                    .failureHandler(oAuth2FailureHandler)
            );

        http.addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
}