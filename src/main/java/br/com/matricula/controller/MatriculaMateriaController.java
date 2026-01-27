package br.com.matricula.controller;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import br.com.matricula.dto.DadosLancamentoNota;
import br.com.matricula.dto.DadosListagemMatriculaMateria;
import br.com.matricula.dto.DadosMatricula;
import br.com.matricula.model.Usuario;
import br.com.matricula.repository.UsuarioRepository;
import br.com.matricula.service.MateriaService;
import br.com.matricula.service.MatriculaService;
import jakarta.validation.Valid;

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

    /**
     * LISTAR MATRÍCULAS ATIVAS (Deste Semestre)
     */
    @GetMapping
    @Transactional(readOnly = true)
    public ResponseEntity<List<DadosListagemMatriculaMateria>> listar() {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        var usuario = (Usuario) usuarioRepository.findByLogin(auth.getName());

        if (usuario == null) return ResponseEntity.status(401).build();

        List<DadosListagemMatriculaMateria> atuais = service.listarMatriculas(usuario)
                .stream()
                .filter(m -> m.isAtiva())
                .collect(Collectors.toList());

        return ResponseEntity.ok(atuais);
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

    /**
     * ENCERRAR SEMESTRE
     * Agora chama o service que move alunos para HISTORICO sem bloquear a Materia
     */
    @PutMapping("/encerrar/{idMateria}")
    @PreAuthorize("hasAuthority('PROFESSOR')")
    @Transactional
    public ResponseEntity<Object> encerrarMateria(@PathVariable Long idMateria) {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        try {
            materiaService.finalizarSemestre(idMateria, auth.getName());
            return ResponseEntity.ok("Semestre encerrado! Os alunos foram movidos para o histórico e a matéria está livre para o próximo período.");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('INSTITUICAO') or hasAuthority('ALUNO')")
    @Transactional
    public ResponseEntity<Object> atualizarStatus(@PathVariable Long id, @RequestBody java.util.Map<String, String> corpo) {
        try {
            var matricula = service.buscarPorId(id);
            if (corpo.containsKey("situacao")) {
                matricula.setStatus(br.com.matricula.model.StatusMatricula.valueOf(corpo.get("situacao")));
                return ResponseEntity.ok().build();
            }
            return ResponseEntity.badRequest().body("Situação não informada");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}