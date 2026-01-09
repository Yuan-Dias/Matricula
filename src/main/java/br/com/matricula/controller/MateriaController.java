package br.com.matricula.controller;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import br.com.matricula.dto.DadosCadastroMateria;
import br.com.matricula.dto.DadosListagemMateria;
import br.com.matricula.service.MateriaService;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/materias")
public class MateriaController {

    @Autowired
    private MateriaService service;

    // CADASTRAR (Geral/Admin)
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

    // LISTAGEM GENÉRICA (Todos os usuários)
    @GetMapping
    public List<DadosListagemMateria> listar() {
        return service.listarTodas();
    }

    // LISTAGEM ESPECÍFICA (Filtro por Curso)
    @GetMapping("/curso/{idCurso}")
    public ResponseEntity<List<DadosListagemMateria>> listarPorCurso(@PathVariable Long idCurso) {
        return ResponseEntity.ok(service.listarPorCurso(idCurso));
    }

    // ATUALIZAR (Admin)
    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('INSTITUICAO')")
    public ResponseEntity<Object> atualizar(@PathVariable Long id, @RequestBody @Valid DadosCadastroMateria dados) {
        try {
            return ResponseEntity.ok(service.atualizar(id, dados));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // EXCLUIR (Admin)
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