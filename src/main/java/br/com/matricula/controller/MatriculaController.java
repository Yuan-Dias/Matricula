package br.com.matricula.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import br.com.matricula.dto.DadosLancamentoNota;
import br.com.matricula.dto.DadosListagemMatricula;
import br.com.matricula.dto.DadosMatricula;
import br.com.matricula.model.Aluno;
import br.com.matricula.model.Matricula;
import br.com.matricula.model.TipoUsuario;
import br.com.matricula.model.Usuario;
import br.com.matricula.repository.AlunoRepository;
import br.com.matricula.repository.MateriaRepository;
import br.com.matricula.repository.MatriculaRepository;
import br.com.matricula.repository.UsuarioRepository;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/matriculas")
public class MatriculaController {

    @Autowired
    private MatriculaRepository matriculaRepository;

    @Autowired
    private AlunoRepository alunoRepository;

    @Autowired
    private MateriaRepository materiaRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    // MATRICULAR
    @SuppressWarnings("null")
    @PostMapping
    @PreAuthorize("hasAuthority('INSTITUICAO') or hasAuthority('ALUNO')")
    public ResponseEntity<Object> matricular(@RequestBody @Valid DadosMatricula dados) {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        var usuarioLogado = (Usuario) usuarioRepository.findByLogin(auth.getName());

        if (usuarioLogado.getTipo() == TipoUsuario.ALUNO && !usuarioLogado.getId().equals(dados.getIdAluno())) {
            return ResponseEntity.status(403).body("Erro: Um aluno não pode matricular outro aluno.");
        }

        var opAluno = alunoRepository.findById(dados.getIdAluno());
        var opMateria = materiaRepository.findById(dados.getIdMateria());

        if (opAluno.isEmpty() || opMateria.isEmpty()) {
            return ResponseEntity.badRequest().body("Aluno ou Matéria não encontrados.");
        }

        Aluno aluno = opAluno.get();

        if (aluno.getTipo() != TipoUsuario.ALUNO) {
            return ResponseEntity.badRequest().body("Erro: O usuário destino deve ser do tipo ALUNO.");
        }

        boolean jaMatriculado = matriculaRepository.findByAlunoLogin(aluno.getLogin())
            .stream()
            .anyMatch(m -> m.getMateria().getId().equals(dados.getIdMateria()));

        if (jaMatriculado) {
            return ResponseEntity.badRequest().body("Aluno já está matriculado nesta disciplina.");
        }

        var matricula = new Matricula(aluno, opMateria.get());
        matriculaRepository.save(matricula);

        return ResponseEntity.ok().build();
    }

    // LISTAR
    @GetMapping
    public List<DadosListagemMatricula> listar() {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        var loginUsuario = auth.getName();
        var usuario = (Usuario) usuarioRepository.findByLogin(loginUsuario);

        if (usuario == null) return List.of();

        // Aluno vê só as dele
        if (usuario.getTipo() == TipoUsuario.ALUNO) {
            return matriculaRepository.findByAlunoLogin(loginUsuario).stream()
                    .map(DadosListagemMatricula::new).toList();
        } 
        
        // Professor vê só as matérias que ele leciona
        if (usuario.getTipo() == TipoUsuario.PROFESSOR) {
            return matriculaRepository.findByMateriaProfessorLogin(loginUsuario).stream()
                    .map(DadosListagemMatricula::new).toList();
        }

        // Instituição vê tudo
        return matriculaRepository.findAll().stream()
                .map(DadosListagemMatricula::new).toList();
    }

    // LANÇAR NOTA 
    @SuppressWarnings("null")
    @PutMapping("/notas")
    @PreAuthorize("hasAuthority('PROFESSOR')")
    public ResponseEntity <Object> lancarNota(@RequestBody @Valid DadosLancamentoNota dados) {
        var opMatricula = matriculaRepository.findById(dados.getIdMatricula());
        if (opMatricula.isEmpty()) return ResponseEntity.badRequest().body("Matrícula não encontrada!");

        Matricula matricula = opMatricula.get();
        var auth = SecurityContextHolder.getContext().getAuthentication();
        var loginProfessorLogado = auth.getName();

        String loginDonoMateria = matricula.getMateria().getProfessor().getLogin();
        if (!loginDonoMateria.equals(loginProfessorLogado)) {
            return ResponseEntity.status(403).body("Acesso Negado: Você não leciona esta matéria.");
        }

        matricula.setNota(dados.getNota());
        matriculaRepository.save(matricula);

        return ResponseEntity.ok("Nota lançada com sucesso!");
    }

    // LISTAR POR CURSO
    @GetMapping("/curso/{idCurso}")
    public ResponseEntity<List<DadosListagemMatricula>> listarPorCurso(@PathVariable Long idCurso) {
        var lista = matriculaRepository.findByMateriaCursoId(idCurso).stream()
                .map(DadosListagemMatricula::new).toList();
        return ResponseEntity.ok(lista);
    }

    // EXCLUIR
    @SuppressWarnings("null")
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('INSTITUICAO') or hasAuthority('ALUNO')")
    public ResponseEntity<Object> excluir(@PathVariable Long id) {
        if (matriculaRepository.existsById(id)) {
            matriculaRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}