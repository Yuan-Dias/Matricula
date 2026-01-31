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

                    // ====================================================
                    // 1. ROTAS PÚBLICAS
                    // ====================================================
                    req.requestMatchers("/error").permitAll();
                    
                    // Login
                    req.requestMatchers(HttpMethod.POST, "/login", "/auth/login").permitAll();
                    
                    // Documentação (Swagger)
                    req.requestMatchers("/v3/api-docs/**", "/swagger-ui/**", "/swagger-ui.html").permitAll();
                    
                    // Configuração Inicial (Setup)
                    req.requestMatchers(HttpMethod.POST, "/usuarios").permitAll();
                    req.requestMatchers(HttpMethod.GET, "/usuarios").permitAll(); 

                    // ====================================================
                    // 2. REGRAS ESPECÍFICAS (Exceções vêm antes das regras gerais)
                    // ====================================================
                    // Notas e Avaliações
                    req.requestMatchers(HttpMethod.PUT, "/materias/*/avaliacoes").hasAuthority("PROFESSOR");
                    req.requestMatchers(HttpMethod.GET, "/materias/*/avaliacoes").authenticated(); // Professor e Aluno leem
                    req.requestMatchers(HttpMethod.PUT, "/matriculas/notas").hasAuthority("PROFESSOR");

                    // ====================================================
                    // 3. DASHBOARD E LEITURA GERAL
                    // ====================================================
                    
                    req.requestMatchers(HttpMethod.GET, "/cursos/**").authenticated();
                    req.requestMatchers(HttpMethod.GET, "/materias/**").authenticated();

                    // ====================================================
                    // 4. GERENCIAMENTO (ESCRITA - POST/PUT/DELETE)
                    // ====================================================

                    // --- USUÁRIOS ---
                    req.requestMatchers(HttpMethod.DELETE, "/usuarios/**").hasAuthority("INSTITUICAO");
                    req.requestMatchers(HttpMethod.PUT, "/usuarios/**").authenticated(); 

                    // --- CURSOS ---
                    req.requestMatchers(HttpMethod.POST, "/cursos/**").hasAuthority("INSTITUICAO");
                    req.requestMatchers(HttpMethod.PUT, "/cursos/**").hasAuthority("INSTITUICAO");
                    req.requestMatchers(HttpMethod.DELETE, "/cursos/**").hasAuthority("INSTITUICAO");

                    // --- MATÉRIAS (Geral) ---
                    req.requestMatchers(HttpMethod.PUT, "/matriculas/encerrar/*").hasAnyAuthority("PROFESSOR", "INSTITUICAO");
                    req.requestMatchers(HttpMethod.POST, "/materias/**").hasAuthority("INSTITUICAO");
                    req.requestMatchers(HttpMethod.PUT, "/materias/**").hasAuthority("INSTITUICAO");
                    req.requestMatchers(HttpMethod.DELETE, "/materias/**").hasAuthority("INSTITUICAO");
                    
                    // ====================================================
                    // 5. OPERAÇÕES DE ALUNOS
                    // ====================================================
                    req.requestMatchers(HttpMethod.POST, "/matriculas").hasAuthority("ALUNO");
                    req.requestMatchers(HttpMethod.GET, "/matriculas/**").authenticated();

                    // --- QUALQUER OUTRA ROTA ---
                    req.anyRequest().authenticated();
                })
                .addFilterBefore(securityFilter, UsernamePasswordAuthenticationFilter.class)
                .build();
    }   

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOriginPatterns(List.of("*"));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS", "HEAD"));
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