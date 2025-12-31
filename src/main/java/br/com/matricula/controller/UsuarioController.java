package br.com.matricula.controller;

import br.com.matricula.model.Usuario;
import br.com.matricula.model.TipoUsuario;
import br.com.matricula.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/usuarios")
public class UsuarioController {

    @Autowired
    private UsuarioRepository repository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    // CRIAR
    @PostMapping
    public ResponseEntity<Object> cadastrar(@RequestBody Usuario dados) {
        if (repository.findByLogin(dados.getLogin()) != null) {
            return ResponseEntity.badRequest().body("Erro: Login já em uso.");
        }
        dados.setSenha(passwordEncoder.encode(dados.getSenha()));
        return ResponseEntity.ok(repository.save(dados));
    }

    // LISTAR TODOS (Para a tela de admin)
    @GetMapping
    public ResponseEntity<List<Usuario>> listarTodos() {
        return ResponseEntity.ok(repository.findAll());
    }

    // LISTAR PROFESSORES (Para o select box)
    @GetMapping("/professores")
    public ResponseEntity<List<Usuario>> listarProfessores() {
        return ResponseEntity.ok(repository.findByTipo(TipoUsuario.PROFESSOR));
    }

    // ATUALIZAR (PUT)
    @PutMapping("/{id}")
    public ResponseEntity<Object> atualizar(@PathVariable Long id, @RequestBody Usuario dados) {
        Optional<Usuario> optional = repository.findById(id);
        if (optional.isPresent()) {
            Usuario user = optional.get();
            user.setNome(dados.getNome());
            user.setLogin(dados.getLogin());
            user.setTipo(dados.getTipo()); // Usa o Enum

            // Atualiza senha apenas se foi enviada
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
    public ResponseEntity<Void> excluir(@PathVariable Long id) {
        if (repository.existsById(id)) {
            repository.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}