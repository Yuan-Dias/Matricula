package br.com.matricula.config;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Autowired
    private SecurityFilter securityFilter;
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        return http
                .csrf(csrf -> csrf.disable())
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(req -> {
                    // --- ROTAS PÚBLICAS ---
                    req.requestMatchers(HttpMethod.POST, "/login").permitAll();
                    req.requestMatchers("/v3/api-docs/**", "/swagger-ui/**", "/swagger-ui.html").permitAll();
                    
                    // --- USUÁRIOS ---
                    // Permitimos o GET para verificar existência e o POST para o primeiro cadastro
                    req.requestMatchers(HttpMethod.GET, "/usuarios").permitAll();
                    req.requestMatchers(HttpMethod.POST, "/usuarios").permitAll(); 
                    
                    // Se você já está logado como INSTITUICAO, você deve ter poder total sobre /usuarios
                    req.requestMatchers(HttpMethod.DELETE, "/usuarios/**").hasRole("INSTITUICAO");
                    req.requestMatchers(HttpMethod.PUT, "/usuarios/**").authenticated();

                    // --- RECURSOS DA INSTITUIÇÃO ---
                    req.requestMatchers(HttpMethod.POST, "/alunos/**").hasRole("INSTITUICAO");
                    req.requestMatchers(HttpMethod.POST, "/cursos/**").hasRole("INSTITUICAO");
                    req.requestMatchers(HttpMethod.POST, "/materias/**").hasRole("INSTITUICAO");

                    // --- RECURSOS DO ALUNO ---
                    req.requestMatchers(HttpMethod.POST, "/matriculas/**").hasRole("ALUNO");

                    // --- QUALQUER USUÁRIO LOGADO ---
                    req.anyRequest().authenticated();
                })
                .addFilterBefore(securityFilter, UsernamePasswordAuthenticationFilter.class)
                .build();
    }   

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOriginPatterns(List.of("*"));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration configuration) throws Exception {
        return configuration.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}