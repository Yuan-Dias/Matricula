package br.com.matricula.service;

import br.com.matricula.model.Usuario;
import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.exceptions.JWTCreationException;
import com.auth0.jwt.exceptions.JWTVerificationException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneOffset;

@Service
public class TokenService {

    @Value("${api.security.token.secret}")
    private String secret; // Pega aquela senha secreta do application.properties

    // Gera o Token
    public String gerarToken(Usuario usuario) {
        try {
            var algoritmo = Algorithm.HMAC256(secret);
            return JWT.create()
                    .withIssuer("API Matriculas") // Quem emitiu
                    .withSubject(usuario.getLogin()) // Dono do token
                    .withExpiresAt(dataExpiracao()) // Validade
                    .sign(algoritmo); // Assina
        } catch (JWTCreationException exception){
            throw new RuntimeException("Erro ao gerar token jwt", exception);
        }
    }

    // Lê o Token e devolve o Login do usuário (se for válido)
    public String getSubject(String tokenJWT) {
        try {
            var algoritmo = Algorithm.HMAC256(secret);
            return JWT.require(algoritmo)
                    .withIssuer("API Matriculas")
                    .build()
                    .verify(tokenJWT) // Verifica se é válido
                    .getSubject(); // Pega o login que tá dentro
        } catch (JWTVerificationException exception){
            throw new RuntimeException("Token JWT inválido ou expirado!");
        }
    }

    // Define que o token vale por 2 horas (fuso horário do Brasil -03:00)
    private Instant dataExpiracao() {
        return LocalDateTime.now().plusHours(2).toInstant(ZoneOffset.of("-03:00"));
    }
}