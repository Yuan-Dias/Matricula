package br.com.matricula.controller;

import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import br.com.matricula.dto.DadosCadastroMateria;
import br.com.matricula.dto.DadosConfiguracao;
import br.com.matricula.dto.DadosListagemMateria;
import br.com.matricula.service.MateriaService;
import jakarta.validation.Valid;
import org.springframework.transaction.annotation.Transactional;

@RestController
@RequestMapping("/materias")
public class MateriaController {

    private final MateriaService service;

    public MateriaController(MateriaService service) {
        this.service = service;
    }

    @PostMapping
    @PreAuthorize("hasAuthority('INSTITUICAO')")
    public ResponseEntity<Object> cadastrar(@RequestBody @Valid DadosCadastroMateria dados) {
        try {
            service.cadastrar(dados);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/curso/{idCurso}")
    public ResponseEntity<List<DadosListagemMateria>> listarPorCurso(@PathVariable Long idCurso) {
        return ResponseEntity.ok(service.listarPorCurso(idCurso));
    }

    @GetMapping("/{id}/avaliacoes")
    public ResponseEntity<List<DadosConfiguracao>> listarAvaliacoes(@PathVariable Long id) {
        return ResponseEntity.ok(service.listarAvaliacoesPorMateria(id));
    }

    @GetMapping("/{id}")
    public ResponseEntity<DadosListagemMateria> detalhar(@PathVariable Long id) {
        try {
            var materia = service.detalhar(id);
            return ResponseEntity.ok(materia);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping
    public ResponseEntity<List<DadosListagemMateria>> listar(
            @RequestParam(required = false) Long professorId
    ) {
        List<DadosListagemMateria> lista;

        if (professorId != null) {
            lista = service.listarPorProfessor(professorId);
        } else {
            lista = service.listarTodas();
        }

        return ResponseEntity.ok(lista);
    }

    @PutMapping("/{id}")
    @Transactional
    @PreAuthorize("hasAnyAuthority('INSTITUICAO', 'PROFESSOR')") 
    public ResponseEntity<Object> atualizar(@PathVariable Long id, @RequestBody @Valid DadosCadastroMateria dados) {
        try {
            var materiaAtualizada = service.atualizar(id, dados);

            if (dados.getAvaliacoes() != null) {
                service.atualizarConfiguracaoAvaliacoes(id, dados.getAvaliacoes());
            }

            return ResponseEntity.ok(materiaAtualizada);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

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

    @PutMapping("/{id}/avaliacoes")
    @PreAuthorize("hasAuthority('INSTITUICAO')")
    public ResponseEntity<Void> atualizarAvaliacoes(@PathVariable Long id, 
                                                    @RequestBody List<DadosConfiguracao> novasAvaliacoes) {
        service.atualizarConfiguracaoAvaliacoes(id, novasAvaliacoes);
        return ResponseEntity.noContent().build();
    }
}