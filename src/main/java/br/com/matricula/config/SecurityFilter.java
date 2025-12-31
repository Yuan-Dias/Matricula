package br.com.matricula.config;

import br.com.matricula.repository.UsuarioRepository;
import br.com.matricula.service.TokenService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class SecurityFilter extends OncePerRequestFilter {

    @Autowired
    private TokenService tokenService;

    @Autowired
    private UsuarioRepository repository;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        var token = this.recuperarToken(request);

        if (token != null) {
            // Tenta validar o token e pegar o email (subject)
            var login = tokenService.getSubject(token);

            if (login != null) {
                // Tenta encontrar o usuário no banco
                UserDetails usuario = repository.findByLogin(login);

                // --- PROTEÇÃO CONTRA USUÁRIO NULO ---
                if (usuario != null) {
                    var authentication = new UsernamePasswordAuthenticationToken(usuario, null, usuario.getAuthorities());
                    SecurityContextHolder.getContext().setAuthentication(authentication);
                    System.out.println("LOG: Usuario autenticado com sucesso: " + login);
                } else {
                    System.out.println("LOG: Token válido, mas usuario não achado no banco (DB reiniciado?): " + login);
                }
            } else {
                System.out.println("LOG: Token inválido ou expirado.");
            }
        }

        filterChain.doFilter(request, response);
    }

    private String recuperarToken(HttpServletRequest request) {
        var authHeader = request.getHeader("Authorization");
        if (authHeader == null) return null;
        return authHeader.replace("Bearer ", "");
    }
}