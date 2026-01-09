package br.com.matricula.controller;

import br.com.matricula.dto.DadosIngressoCurso;
import br.com.matricula.dto.DadosListagemMatriculaCurso;
import br.com.matricula.service.MatriculaService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/matriculas/curso")
public class MatriculaCursoController {

    @Autowired
    private MatriculaService service;

    /**
     * REGISTRAR INGRESSO EM CURSO
     * Funcionalidade Geral: Instituição matricula aluno ou Aluno se auto-matricula.
     */
    @PostMapping
    @PreAuthorize("hasAuthority('INSTITUICAO') or hasAuthority('ALUNO')")
    public ResponseEntity<Object> registrarIngresso(@RequestBody @Valid DadosIngressoCurso dados) {
        try {
            service.registrarIngressoCurso(dados);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            // Captura erros de duplicidade ou IDs inexistentes validados na Service
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    /**
     * LISTAGEM ESPECÍFICA POR ALUNO
     * Retorna a lista de cursos (ex: Engenharia, Direito) vinculados a um aluno.
     */
    @GetMapping("/aluno/{idAluno}")
    public ResponseEntity<List<DadosListagemMatriculaCurso>> listarPorAluno(@PathVariable Long idAluno) {
        return ResponseEntity.ok(service.listarCursosPorAluno(idAluno));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('INSTITUICAO') or hasAuthority('ALUNO')")
    public ResponseEntity<Object> cancelarMatriculaCurso(@PathVariable Long id) {
        try {
            service.cancelarMatriculaCurso(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}