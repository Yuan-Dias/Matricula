package br.com.matricula.service;

import br.com.matricula.dto.*;
import br.com.matricula.model.*;
import br.com.matricula.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class MatriculaService {

    @Autowired private MatriculaRepository matriculaRepository;
    @Autowired private MatriculaCursoRepository matriculaCursoRepository;
    @Autowired private AlunoRepository alunoRepository;
    @Autowired private CursoRepository cursoRepository;
    @Autowired private MateriaRepository materiaRepository;
    
    // --- MÉTODOS DE AÇÃO (POST/PUT) ---

    @SuppressWarnings("null")
    // No arquivo MatriculaService.java
    @Transactional
    public void registrarIngressoCurso(DadosIngressoCurso dados) {
        var aluno = alunoRepository.findById(dados.getIdAluno())
                .orElseThrow(() -> new RuntimeException("Aluno não encontrado ou usuário não possui perfil de aluno."));

        var curso = cursoRepository.findById(dados.getIdCurso())
                .orElseThrow(() -> new RuntimeException("Curso não encontrado"));

        // Validação de duplicidade
        if (matriculaCursoRepository.existsByAlunoIdAndCursoId(dados.getIdAluno(), dados.getIdCurso())) {
            throw new RuntimeException("Aluno já está neste curso.");
        }

        matriculaCursoRepository.save(new MatriculaCurso(aluno, curso));
    }

    @SuppressWarnings("null")
    @Transactional
    public void matricularNaMateria(DadosMatricula dados, Usuario usuarioLogado) {
        if (usuarioLogado.getTipo() == TipoUsuario.ALUNO && !usuarioLogado.getId().equals(dados.getIdAluno())) {
            throw new RuntimeException("Um aluno não pode matricular outro aluno.");
        }

        var aluno = alunoRepository.findById(dados.getIdAluno())
                .orElseThrow(() -> new RuntimeException("Aluno não encontrado"));
        var materia = materiaRepository.findById(dados.getIdMateria())
                .orElseThrow(() -> new RuntimeException("Matéria não encontrada"));

        // 1. Buscamos o vínculo ativo do aluno com o curso daquela matéria
        var vinculoCurso = matriculaCursoRepository
                .findByAlunoIdAndCursoId(aluno.getId(), materia.getCurso().getId())
                .stream().findFirst()
                .orElseThrow(() -> new RuntimeException("O aluno deve estar matriculado no curso " + materia.getCurso().getNome() + " antes."));

        // 2. Validação de duplicidade na matéria
        boolean jaMatriculado = matriculaRepository.findByAlunoLogin(aluno.getLogin()).stream()
                .anyMatch(m -> m.getMateria().getId().equals(dados.getIdMateria()));
        
        if (jaMatriculado) throw new RuntimeException("Aluno já matriculado nesta disciplina.");

        // 3. Salvamos a matrícula vinculando-a ao MatriculaCurso (essencial para o Cascade)
        var novaMatricula = new Matricula(aluno, materia, vinculoCurso);
        matriculaRepository.save(novaMatricula);
    }

    @SuppressWarnings("null")
    @Transactional
    public void lancarNota(DadosLancamentoNota dados, String loginProfessorLogado) {
        var matricula = matriculaRepository.findById(dados.getIdMatricula())
                .orElseThrow(() -> new RuntimeException("Matrícula não encontrada"));

        if (!matricula.getMateria().getProfessor().getLogin().equals(loginProfessorLogado)) {
            throw new RuntimeException("Você não leciona esta matéria.");
        }

        matricula.setNota(dados.getNota());
        matriculaRepository.save(matricula);
    }

    // --- MÉTODOS DE LISTAGEM (GET) ---

    /**
     * Listagem Geral de Matrículas (Filtrada por perfil do usuário logado)
     */
    public List<DadosListagemMatriculaMateria> listarMatriculas(Usuario usuario) {
        return switch (usuario.getTipo()) {
            case ALUNO -> 
                matriculaRepository.findByAlunoLogin(usuario.getLogin())
                        .stream()
                        .map(DadosListagemMatriculaMateria::new)
                        .toList();
            
            case PROFESSOR -> 
                matriculaRepository.findByMateriaProfessorLogin(usuario.getLogin())
                        .stream()
                        .map(DadosListagemMatriculaMateria::new)
                        .toList();
            
            case INSTITUICAO -> 
                matriculaRepository.findAll()
                        .stream()
                        .map(DadosListagemMatriculaMateria::new)
                        .toList();
        };
    }

    /**
     * Listagem Específica: Matrículas de matérias por ID do Curso
     */
    public List<DadosListagemMatriculaMateria> listarMatriculasPorCurso(Long idCurso) {
        return matriculaRepository.findByMateriaCursoId(idCurso).stream()
                .map(DadosListagemMatriculaMateria::new)
                .toList();
    }

    /**
     * Listagem Específica: Ingressos em cursos por ID do Aluno
     */
    public List<DadosListagemMatriculaCurso> listarCursosPorAluno(Long idAluno) {
        return matriculaCursoRepository.findByAlunoId(idAluno).stream()
                .map(DadosListagemMatriculaCurso::new)
                .toList();
    }

    /**
     * CANCELAR MATRÍCULA EM MATÉRIA (TRANCAR)
     */
    @SuppressWarnings("null")
    @Transactional
    public void cancelarMatriculaMateria(Long id) {
        if (!matriculaRepository.existsById(id)) {
            throw new RuntimeException("Matrícula em disciplina não encontrada.");
        }
        matriculaRepository.deleteById(id);
    }

    /**
     * CANCELAR MATRÍCULA EM CURSO
     * Ao excluir o vínculo com o curso, as matrículas das matérias 
     * vinculadas a esse ingresso também serão removidas se o Cascade estiver configurado.
     */
    @SuppressWarnings("null")
    @Transactional
    public void cancelarMatriculaCurso(Long id) {
        if (!matriculaCursoRepository.existsById(id)) {
            throw new RuntimeException("Matrícula de curso não encontrada.");
        }
        matriculaCursoRepository.deleteById(id);
    }
}