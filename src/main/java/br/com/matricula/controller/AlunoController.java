package br.com.matricula.controller;

import java.util.List;
import java.util.stream.Collectors;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import br.com.matricula.dto.DadosAluno;
import br.com.matricula.dto.DadosListagemAluno;
import br.com.matricula.service.AlunoService;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/alunos")
public class AlunoController {

    private final AlunoService service;

    public AlunoController(AlunoService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<Object> cadastrar(@RequestBody @Valid DadosAluno dados) {
        try {
            service.cadastrar(dados);
            return ResponseEntity.status(HttpStatus.CREATED).body("Aluno cadastrado com sucesso!");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<List<DadosListagemAluno>> listar() {
        List<DadosListagemAluno> lista = service.listar().stream()
                .map(DadosListagemAluno::new)
                .collect(Collectors.toList());
        return ResponseEntity.ok(lista);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Object> atualizar(@PathVariable Long id, @RequestBody @Valid DadosAluno dados) {
        try {
            return ResponseEntity.ok(service.atualizar(id, dados));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Object> excluir(@PathVariable Long id) {
        try {
            service.excluir(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}