package br.com.matricula.controller;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import br.com.matricula.dto.DadosCurso;
import br.com.matricula.dto.DadosListagemCurso;
import br.com.matricula.service.CursoService;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/cursos")
public class CursoController {

    @Autowired
    private CursoService service;

    /**
     * CADASTRO DE CURSO (Função Específica da Instituição)
     * Bloqueia o acesso de Alunos e Professores através do PreAuthorize.
     */
    @PostMapping
    @PreAuthorize("hasAuthority('INSTITUICAO')")
    public ResponseEntity<Object> cadastrar(@RequestBody @Valid DadosCurso dados) {
        try {
            service.cadastrar(dados);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            // Retorna o erro vindo da Service (ex: Professor não encontrado ou tipo inválido)
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * LISTAGEM GERAL
     * Retorna todos os cursos usando DadosListagemCurso para evitar 
     * erros de recursão (loop infinito) no JSON.
     */
    @GetMapping
    public List<DadosListagemCurso> listar() {
        return service.listarTodos();
    }

    /**
     * ATUALIZAÇÃO DE CURSO
     * Permite à Instituição alterar dados do curso e o professor responsável.
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('INSTITUICAO')")
    public ResponseEntity<Object> atualizar(@PathVariable Long id, @RequestBody @Valid DadosCurso dados) {
        try {
            return ResponseEntity.ok(service.atualizar(id, dados));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * EXCLUSÃO DE CURSO
     * Remove o curso do sistema. Note que as matérias vinculadas 
     * devem ser tratadas (geralmente via cascade no banco ou lógica na Service).
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('INSTITUICAO')")
    public ResponseEntity<Object> excluir(@PathVariable Long id) {
        try {
            service.excluir(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}