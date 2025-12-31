package br.com.matricula.controller;

import br.com.matricula.dto.DadosCadastroMateria;
import br.com.matricula.model.Materia;
import br.com.matricula.repository.CursoRepository;
import br.com.matricula.repository.MateriaRepository;
import br.com.matricula.repository.UsuarioRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/materias")
public class MateriaController {

    @Autowired
    private MateriaRepository materiaRepository;

    @Autowired
    private CursoRepository cursoRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @PostMapping
    @PreAuthorize("hasAuthority('INSTITUICAO')")
    public ResponseEntity cadastrar(@RequestBody @Valid DadosCadastroMateria dados) {

        var curso = cursoRepository.findById(dados.getIdCurso());
        var professor = usuarioRepository.findById(dados.getIdProfessor());

        if (curso.isEmpty() || professor.isEmpty()) {
            return ResponseEntity.badRequest().body("Curso ou Professor inválidos");
        }

        var materia = new Materia(
                dados.getNome(),
                dados.getDescricao(),
                curso.get(),
                professor.get()
        );

        materiaRepository.save(materia);

        return ResponseEntity.ok().body("Matéria criada e professor vinculado!");
    }

    @GetMapping
    public List<Materia> listar() {
        return materiaRepository.findAll();
    }
}