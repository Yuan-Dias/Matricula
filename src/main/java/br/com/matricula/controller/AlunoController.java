package br.com.matricula.controller;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import br.com.matricula.dto.DadosAluno;
import br.com.matricula.model.Aluno;
import br.com.matricula.service.AlunoService;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/alunos")
public class AlunoController {

    @Autowired
    private AlunoService service;

    /**
     * CADASTRO DE ALUNO
     * Retorna 201 Created em caso de sucesso ou 400 Bad Request se houver erro de negócio (ex: e-mail duplicado).
     */
    @PostMapping
    public ResponseEntity<Object> cadastrar(@RequestBody @Valid DadosAluno dados) {
        try {
            service.cadastrar(dados);
            return ResponseEntity.status(HttpStatus.CREATED).body("Aluno cadastrado com sucesso!");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * LISTAGEM GERAL
     * Retorna a lista completa de alunos cadastrados.
     */
    @GetMapping
    public ResponseEntity<List<Aluno>> listar() {
        return ResponseEntity.ok(service.listar());
    }

    /**
     * ATUALIZAÇÃO DE ALUNO
     * Recebe o ID via URL e os novos dados via JSON.
     * Retorna 404 se o ID não existir ou 200 se a atualização for bem-sucedida.
     */
    @PutMapping("/{id}")
    public ResponseEntity<Object> atualizar(@PathVariable Long id, @RequestBody @Valid DadosAluno dados) {
        try {
            return ResponseEntity.ok(service.atualizar(id, dados));
        } catch (RuntimeException e) {
            // Caso a Service lance erro de "não encontrado" ou e-mail já em uso
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    /**
     * EXCLUSÃO DE ALUNO
     * Retorna 204 No Content se excluído com sucesso ou 404 se o aluno não existir.
     */
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