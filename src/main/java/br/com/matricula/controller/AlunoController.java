package br.com.matricula.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
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

import br.com.matricula.dto.DadosAluno;
import br.com.matricula.model.Aluno;
import br.com.matricula.repository.AlunoRepository;
import br.com.matricula.repository.UsuarioRepository;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/alunos")
public class AlunoController {

    @Autowired
    private AlunoRepository repository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private PasswordEncoder passwordEncoder; 

    // CADASTRAR
    @PostMapping
    public ResponseEntity<Object> cadastrar(@RequestBody @Valid DadosAluno dados) {
        String emailPadrao = dados.getEmail().trim().toLowerCase();

        if (usuarioRepository.findByLogin(emailPadrao) != null) {
            return ResponseEntity.badRequest().body("Erro: Este e-mail já está cadastrado no sistema.");
        }

        Aluno aluno = new Aluno(dados);
        aluno.setEmail(emailPadrao);
        
        aluno.setCpf(dados.getCpf().replaceAll("\\D", ""));
        
        aluno.setSenha(passwordEncoder.encode(aluno.getSenha())); 

        repository.save(aluno); 

        return ResponseEntity.status(HttpStatus.CREATED).body("Aluno cadastrado com sucesso!");
    }

    // LISTAR TODOS
    @GetMapping
    public ResponseEntity<List<Aluno>> listar() {
        List<Aluno> lista = repository.findAll();
        return ResponseEntity.ok(lista);
    }

    // ATUALIZAR
    @SuppressWarnings("null")
    @PutMapping("/{id}")
    public ResponseEntity<Aluno> atualizar(@PathVariable Long id, @RequestBody @Valid DadosAluno dados) {
        return repository.findById(id).map(aluno -> {
            aluno.setNome(dados.getNome());
            aluno.setEmail(dados.getEmail());
            aluno.setCpf(dados.getCpf());
            repository.save(aluno);
            return ResponseEntity.ok(aluno);
        }).orElse(ResponseEntity.notFound().build());
    }

    // EXCLUIR
    @SuppressWarnings("null")
    @DeleteMapping("/{id}")
    public ResponseEntity<Object> excluir(@PathVariable Long id) {
        if (repository.existsById(id)) {
            repository.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}