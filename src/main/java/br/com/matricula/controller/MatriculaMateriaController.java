package br.com.matricula.controller;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import br.com.matricula.dto.*;
import br.com.matricula.model.*;
import br.com.matricula.repository.UsuarioRepository;
import br.com.matricula.service.MatriculaService;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/matriculas")
public class MatriculaMateriaController {

    @Autowired
    private MatriculaService service;
    
    @Autowired
    private UsuarioRepository usuarioRepository;

    /**
     * EFETUAR MATRÍCULA EM DISCIPLINA
     * Valida se o aluno já pertence ao curso da disciplina antes de matricular.
     */
    @PostMapping
    @PreAuthorize("hasAuthority('INSTITUICAO') or hasAuthority('ALUNO')")
    public ResponseEntity<Object> matricular(@RequestBody @Valid DadosMatricula dados) {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        var usuarioLogado = (Usuario) usuarioRepository.findByLogin(auth.getName());
        try {
            service.matricularNaMateria(dados, usuarioLogado);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * LISTAGEM DINÂMICA
     * O retorno varia conforme o usuário logado (Aluno, Professor ou Instituição).
     */
    @GetMapping
    public List<DadosListagemMatriculaMateria> listar() {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        var usuario = (Usuario) usuarioRepository.findByLogin(auth.getName());
        return service.listarMatriculas(usuario);
    }

    /**
     * LISTAGEM ESPECÍFICA POR CURSO
     * Retorna todas as matrículas de disciplinas vinculadas a um curso específico.
     */
    @GetMapping("/curso/{idCurso}")
    public ResponseEntity<List<DadosListagemMatriculaMateria>> listarPorCurso(@PathVariable Long idCurso) {
        return ResponseEntity.ok(service.listarMatriculasPorCurso(idCurso));
    }

    /**
     * LANÇAMENTO DE NOTAS
     * Funcionalidade exclusiva do Professor da disciplina.
     */
    @PutMapping("/notas")
    @PreAuthorize("hasAuthority('PROFESSOR')")
    public ResponseEntity<Object> lancarNota(@RequestBody @Valid DadosLancamentoNota dados) {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        try {
            service.lancarNota(dados, auth.getName());
            return ResponseEntity.ok("Nota lançada com sucesso!");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('INSTITUICAO') or hasAuthority('ALUNO')")
    public ResponseEntity<Object> cancelarMatricula(@PathVariable Long id) {
        try {
            service.cancelarMatriculaMateria(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}