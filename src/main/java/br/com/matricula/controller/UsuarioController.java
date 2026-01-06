package br.com.matricula.controller;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import br.com.matricula.dto.DadosCadastro;
import br.com.matricula.model.TipoUsuario;
import br.com.matricula.model.Usuario;
import br.com.matricula.repository.UsuarioRepository;

@RestController
@RequestMapping("/usuarios")
public class UsuarioController {

    @Autowired
    private UsuarioRepository repository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    // CADASTRAR
    @PostMapping
    public ResponseEntity<Object> cadastrar(@RequestBody DadosCadastro dados) {
        String loginLimpo = dados.getLogin().trim().toLowerCase();
        
        boolean sistemaVazio = repository.count() == 0;

        // Regra do Primeiro Acesso
        if (sistemaVazio && dados.getTipo() != TipoUsuario.INSTITUICAO) {
            return ResponseEntity.badRequest().body("O primeiro usuário do sistema deve ser do tipo INSTITUICAO.");
        }

        // Regra de bloqueio para não-admin
        if (!sistemaVazio) {
            var auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
            
            if (auth == null || !auth.isAuthenticated() || auth.getPrincipal().equals("anonymousUser")) {
                return ResponseEntity.status(401).body("Erro: Login de Instituição necessário.");
            }

            boolean isInstituicao = auth.getAuthorities().stream()
                    .anyMatch(a -> a.getAuthority().equals("INSTITUICAO"));

            if (!isInstituicao) {
                return ResponseEntity.status(403).body("Erro: Apenas a Instituição pode cadastrar usuários.");
            }
        }

        if (repository.findByLogin(loginLimpo) != null) {
            return ResponseEntity.badRequest().body("Erro: Login já em uso.");
        }
        
        Usuario novoUsuario = new Usuario();
        novoUsuario.setLogin(loginLimpo);
        novoUsuario.setNome(dados.getNome().trim());
        novoUsuario.setTipo(dados.getTipo());
        novoUsuario.setSenha(passwordEncoder.encode(dados.getSenha()));
        
        repository.save(novoUsuario);
        return ResponseEntity.ok().build();
    }

    // LISTAR TODOS
    @GetMapping
    public ResponseEntity<List<Usuario>> listarTodos() {
        return ResponseEntity.ok(repository.findAll());
    }

    // LISTAR POR TIPO
    @GetMapping("/tipo/{tipo}")
    public ResponseEntity<List<Usuario>> listarPorTipo(@PathVariable TipoUsuario tipo) {
        return ResponseEntity.ok(repository.findByTipo(tipo));
    }

    // ATUALIZAR
    @PutMapping("/{id}")
    @SuppressWarnings("null")
    public ResponseEntity <Object> atualizar(@PathVariable Long id, @RequestBody Usuario dados) {
        Optional<Usuario> optional = repository.findById(id);
        if (optional.isPresent()) {
            Usuario user = optional.get();
            user.setNome(dados.getNome().trim());
            user.setLogin(dados.getLogin().trim().toLowerCase());

            if (dados.getSenha() != null && !dados.getSenha().isBlank()) {
                user.setSenha(passwordEncoder.encode(dados.getSenha()));
            }

            repository.save(user);
            return ResponseEntity.ok(user);
        }
        return ResponseEntity.notFound().build();
    }

    // EXCLUIR
    @DeleteMapping("/{id}")
    @SuppressWarnings("null")
    public ResponseEntity<Void> excluir(@PathVariable Long id) {
        if (repository.existsById(id)) {
            repository.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}