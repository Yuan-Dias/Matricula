package br.com.matricula.controller;

import br.com.matricula.dto.DadosLancamentoNota;
import br.com.matricula.dto.DadosListagemMatricula;
import br.com.matricula.dto.DadosMatricula;
import br.com.matricula.model.Matricula;
import br.com.matricula.model.TipoUsuario;
import br.com.matricula.model.Usuario;
import br.com.matricula.repository.AlunoRepository;
import br.com.matricula.repository.MateriaRepository;
import br.com.matricula.repository.MatriculaRepository;
import br.com.matricula.repository.UsuarioRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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

    @PostMapping
    @PreAuthorize("hasAuthority('INSTITUICAO') or hasAuthority('ALUNO')")
    public ResponseEntity matricular(@RequestBody @Valid DadosMatricula dados) {

        var aluno = alunoRepository.findById(dados.getIdAluno());
        var materia = materiaRepository.findById(dados.getIdMateria());

        if (aluno.isEmpty() || materia.isEmpty()) {
            return ResponseEntity.badRequest().body("Aluno ou Matéria não encontrados.");
        }

        boolean jaMatriculado = matriculaRepository.findByAlunoLogin(aluno.get().getLogin())
                .stream()
                .anyMatch(m -> m.getMateria().getId().equals(materia.get().getId()));

        if (jaMatriculado) {
            return ResponseEntity.badRequest().body("Erro: Aluno já matriculado nesta matéria!");
        }

        var matricula = new Matricula(aluno.get(), materia.get());
        matriculaRepository.save(matricula);

        return ResponseEntity.ok().build();
    }

    @GetMapping
    public List<DadosListagemMatricula> listar() {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        var loginUsuario = auth.getName();
        Usuario usuario = (Usuario) usuarioRepository.findByLogin(loginUsuario);

        if (usuario.getTipo() == TipoUsuario.ALUNO) {
            return matriculaRepository.findByAlunoLogin(loginUsuario).stream()
                    .map(DadosListagemMatricula::new).toList();

        } else if (usuario.getTipo() == TipoUsuario.PROFESSOR) {
            return matriculaRepository.findByMateriaProfessorLogin(loginUsuario).stream()
                    .map(DadosListagemMatricula::new).toList();

        } else {
            return matriculaRepository.findAll().stream()
                    .map(DadosListagemMatricula::new).toList();
        }
    }

    @PutMapping("/notas")
    @PreAuthorize("hasAuthority('PROFESSOR')")
    public ResponseEntity lancarNota(@RequestBody @Valid DadosLancamentoNota dados) {

        var opMatricula = matriculaRepository.findById(dados.getIdMatricula());
        if (opMatricula.isEmpty()) return ResponseEntity.badRequest().body("Matrícula não encontrada!");

        Matricula matricula = opMatricula.get();

        var auth = SecurityContextHolder.getContext().getAuthentication();
        var loginProfessorLogado = auth.getName();

        String loginDonoMateria = matricula.getMateria().getProfessor().getLogin();

        if (!loginDonoMateria.equals(loginProfessorLogado)) {
            return ResponseEntity.status(403).body("Acesso Negado: Você não é o professor desta matéria.");
        }

        matricula.setNota(dados.getNota());
        matriculaRepository.save(matricula);

        return ResponseEntity.ok("Nota lançada com sucesso!");
    }
}