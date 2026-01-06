package br.com.matricula.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import br.com.matricula.dto.DadosCurso;
import br.com.matricula.model.Curso;
import br.com.matricula.repository.CursoRepository;
import br.com.matricula.repository.UsuarioRepository;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/cursos")
public class CursoController {

    @Autowired
    private CursoRepository repository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    // CADASTRAR
    @PostMapping
    @PreAuthorize("hasAuthority('INSTITUICAO')")
    public ResponseEntity <Object> cadastrar(@RequestBody @Valid DadosCurso dados) {

        @SuppressWarnings("null")
        var professor = usuarioRepository.findById(dados.getIdProfessor());

        if (professor.isEmpty()) {
            return ResponseEntity.badRequest().body("Professor informado não existe (ID inválido)");
        }

        var curso = new Curso(dados, professor.get());

        repository.save(curso);
        return ResponseEntity.ok().build();
    }

    // LISTAR TODOS
    @GetMapping
    public List<Curso> listar() {
        return repository.findAll();
    }

    // ATUALIZAR
    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('INSTITUICAO')")
    public ResponseEntity<Object> atualizar(@PathVariable Long id, @RequestBody @Valid DadosCurso dados) {
        @SuppressWarnings("null")
        var cursoOptional = repository.findById(id);
        if (cursoOptional.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        var curso = cursoOptional.get();
        @SuppressWarnings("null")
        var professor = usuarioRepository.findById(dados.getIdProfessor());
        
        if (professor.isEmpty()) {
            return ResponseEntity.badRequest().body("Professor inválido");
        }

        curso.setNome(dados.getNome());
        curso.setDescricao(dados.getDescricao());
        curso.setCargaHoraria(dados.getCargaHoraria());
        curso.setProfessor(professor.get());

        repository.save(curso);
        return ResponseEntity.ok(curso);
    }

    // EXCLUIR
    @SuppressWarnings("null")
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('INSTITUICAO')")
    public ResponseEntity<Object> excluir(@PathVariable Long id) {
        if (repository.existsById(id)) {
            repository.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}