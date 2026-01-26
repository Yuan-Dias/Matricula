package br.com.matricula.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import br.com.matricula.dto.*;
import br.com.matricula.model.Usuario;
import br.com.matricula.repository.UsuarioRepository;
import br.com.matricula.service.*;
import jakarta.validation.Valid;
import org.springframework.transaction.annotation.Transactional;

@RestController
@RequestMapping("/matriculas")
public class MatriculaMateriaController {

    private final MatriculaService service;
    private final MateriaService materiaService;
    private final UsuarioRepository usuarioRepository;

    public MatriculaMateriaController(MatriculaService service, MateriaService materiaService, UsuarioRepository usuarioRepository) {
        this.service = service;
        this.materiaService = materiaService;
        this.usuarioRepository = usuarioRepository;
    }

    @PostMapping
    @PreAuthorize("hasAuthority('INSTITUICAO') or hasAuthority('ALUNO')")
    public ResponseEntity<Object> matricular(@RequestBody @Valid DadosMatricula dados) {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        var usuarioLogado = (Usuario) usuarioRepository.findByLogin(auth.getName());

        if (usuarioLogado == null) return ResponseEntity.status(401).build();

        try {
            service.matricularNaMateria(dados, usuarioLogado);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping
    @Transactional(readOnly = true)
    public ResponseEntity<List<DadosListagemMatriculaMateria>> listar() {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        var usuario = (Usuario) usuarioRepository.findByLogin(auth.getName());

        if (usuario == null) return ResponseEntity.status(401).build();

        return ResponseEntity.ok(service.listarMatriculas(usuario));
    }

    @GetMapping("/curso/{idCurso}")
    public ResponseEntity<List<DadosListagemMatriculaMateria>> listarPorCurso(@PathVariable Long idCurso) {
        return ResponseEntity.ok(service.listarMatriculasPorCurso(idCurso));
    }

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

    @PutMapping("/encerrar/{idMateria}")
    @PreAuthorize("hasAuthority('PROFESSOR')")
    @Transactional
    public ResponseEntity<Object> encerrarMateria(@PathVariable Long idMateria) {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        try {
            materiaService.finalizarSemestre(idMateria, auth.getName());
            return ResponseEntity.ok("Matéria encerrada e notas finais consolidadas!");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{id}")
@PreAuthorize("hasAuthority('INSTITUICAO') or hasAuthority('ALUNO')")
@Transactional
public ResponseEntity<Object> atualizarStatus(@PathVariable Long id, @RequestBody java.util.Map<String, String> corpo) {
    try {
        var matricula = service.buscarPorId(id); // Você precisará criar esse método simples no Service
        if (corpo.containsKey("situacao")) {
            // Supondo que sua model Matricula tenha o método setSituacao e aceite String ou Enum
            matricula.setSituacao(br.com.matricula.model.StatusMatricula.valueOf(corpo.get("situacao")));
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.badRequest().body("Situação não informada");
    } catch (Exception e) {
        return ResponseEntity.badRequest().body(e.getMessage());
    }
}
}