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

import br.com.matricula.dto.DadosCadastroMateria;
import br.com.matricula.model.Materia;
import br.com.matricula.repository.CursoRepository;
import br.com.matricula.repository.MateriaRepository;
import br.com.matricula.repository.UsuarioRepository;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/materias")
public class MateriaController {

    @Autowired
    private MateriaRepository materiaRepository;

    @Autowired
    private CursoRepository cursoRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    // CADASTRAR MATÉRIA
    @PostMapping
    @PreAuthorize("hasAuthority('INSTITUICAO')")
    public ResponseEntity <Object> cadastrar(@RequestBody @Valid DadosCadastroMateria dados) {

        @SuppressWarnings("null")
        var curso = cursoRepository.findById(dados.getIdCurso());
        @SuppressWarnings("null")
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

    // LISTAR TODAS AS MATÉRIAS
    @GetMapping
    public List<Materia> listar() {
        return materiaRepository.findAll();
    }

    // Listar matérias de um curso específico
    @GetMapping("/curso/{idCurso}")
    public ResponseEntity<List<Materia>> listarPorCurso(@PathVariable Long idCurso) {
        return ResponseEntity.ok(materiaRepository.findByCursoId(idCurso));
    }

    // ATUALIZAR MATÉRIA
    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('INSTITUICAO')")
    public ResponseEntity<Object> atualizar(@PathVariable Long id, @RequestBody @Valid DadosCadastroMateria dados) {
        @SuppressWarnings("null")
        var opMateria = materiaRepository.findById(id);
        if (opMateria.isEmpty()) return ResponseEntity.notFound().build();

        var materia = opMateria.get();
        materia.setNome(dados.getNome());
        materia.setDescricao(dados.getDescricao());
        
        // Opcional: atualizar curso ou professor se os IDs vierem no DTO
        materiaRepository.save(materia);
        return ResponseEntity.ok(materia);
    }

    // EXCLUIR MATÉRIA (Vai apagar as matrículas em cascata)
    @SuppressWarnings("null")
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('INSTITUICAO')")
    public ResponseEntity<Object> excluir(@PathVariable Long id) {
        if (materiaRepository.existsById(id)) {
            materiaRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}