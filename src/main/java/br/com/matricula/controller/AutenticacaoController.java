package br.com.matricula.controller;

import br.com.matricula.dto.DadosLogin;
import br.com.matricula.dto.DadosTokenJWT;
import br.com.matricula.model.Usuario;
import br.com.matricula.service.TokenService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class AutenticacaoController {

    @Autowired
    private AuthenticationManager manager;

    @Autowired
    private TokenService tokenService;

    @PostMapping("/login")
    public ResponseEntity <Object> efetuarLogin(@RequestBody @Valid DadosLogin dados) {
        UsernamePasswordAuthenticationToken authenticationToken = 
            new UsernamePasswordAuthenticationToken(dados.getLogin(), dados.getSenha());

        Authentication authentication = manager.authenticate(authenticationToken);

        Usuario usuarioLogado = (Usuario) authentication.getPrincipal();

        String tokenJWT = tokenService.gerarToken(usuarioLogado);

        DadosTokenJWT resposta = new DadosTokenJWT(
            tokenJWT, 
            usuarioLogado.getLogin(), 
            usuarioLogado.getTipo()
        );

        return ResponseEntity.ok(resposta);
    }
}