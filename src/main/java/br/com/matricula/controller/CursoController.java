package br.com.matricula.controller;

import br.com.matricula.dto.DadosCurso;
import br.com.matricula.model.Curso;
import br.com.matricula.repository.CursoRepository;
import br.com.matricula.repository.UsuarioRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/cursos")
public class CursoController {

    @Autowired
    private CursoRepository repository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @PostMapping
    @PreAuthorize("hasAuthority('INSTITUICAO')")
    public ResponseEntity cadastrar(@RequestBody @Valid DadosCurso dados) {

        var professor = usuarioRepository.findById(dados.getIdProfessor());

        if (professor.isEmpty()) {
            return ResponseEntity.badRequest().body("Professor informado não existe (ID inválido)");
        }

        var curso = new Curso(dados, professor.get());

        repository.save(curso);
        return ResponseEntity.ok().build();
    }

    @GetMapping
    public List<Curso> listar() {
        return repository.findAll();
    }
}