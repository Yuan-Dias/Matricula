package br.com.matricula.service;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.matricula.dto.DadosIngressoCurso;
import br.com.matricula.dto.DadosLancamentoNota;
import br.com.matricula.dto.DadosListagemMatriculaCurso;
import br.com.matricula.dto.DadosListagemMatriculaMateria;
import br.com.matricula.dto.DadosMatricula;
import br.com.matricula.model.ConfiguracaoAvaliacao;
import br.com.matricula.model.Matricula;
import br.com.matricula.model.MatriculaCurso;
import br.com.matricula.model.Nota;
import br.com.matricula.model.TipoUsuario;
import br.com.matricula.model.Usuario;
import br.com.matricula.repository.AlunoRepository;
import br.com.matricula.repository.ConfiguracaoAvaliacaoRepository;
import br.com.matricula.repository.CursoRepository;
import br.com.matricula.repository.MateriaRepository;
import br.com.matricula.repository.MatriculaCursoRepository;
import br.com.matricula.repository.MatriculaRepository;
import br.com.matricula.repository.NotaRepository;

@Service
public class MatriculaService {

    private final MatriculaRepository matriculaRepository;
    private final MatriculaCursoRepository matriculaCursoRepository;
    private final AlunoRepository alunoRepository;
    private final CursoRepository cursoRepository;
    private final MateriaRepository materiaRepository;
    private final ConfiguracaoAvaliacaoRepository configuracaoRepository; 
    private final NotaRepository notaRepository;

    public MatriculaService(MatriculaRepository matriculaRepository,
                            MatriculaCursoRepository matriculaCursoRepository,
                            AlunoRepository alunoRepository,
                            CursoRepository cursoRepository,
                            MateriaRepository materiaRepository,
                            ConfiguracaoAvaliacaoRepository configuracaoRepository,
                            NotaRepository notaRepository) {
        this.matriculaRepository = matriculaRepository;
        this.matriculaCursoRepository = matriculaCursoRepository;
        this.alunoRepository = alunoRepository;
        this.cursoRepository = cursoRepository;
        this.materiaRepository = materiaRepository;
        this.configuracaoRepository = configuracaoRepository;
        this.notaRepository = notaRepository;
    }

    // --- MÉTODOS DE AÇÃO (POST/PUT) ---

    @SuppressWarnings("null")
    @Transactional
    public void registrarIngressoCurso(DadosIngressoCurso dados) {
        var aluno = alunoRepository.findById(dados.getIdAluno())
                .orElseThrow(() -> new RuntimeException("Aluno não encontrado ou usuário não possui perfil de aluno."));

        var curso = cursoRepository.findById(dados.getIdCurso())
                .orElseThrow(() -> new RuntimeException("Curso não encontrado"));

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

        var vinculoCurso = matriculaCursoRepository
                .findByAlunoIdAndCursoId(aluno.getId(), materia.getCurso().getId())
                .stream().findFirst()
                .orElseThrow(() -> new RuntimeException("O aluno deve estar matriculado no curso " + materia.getCurso().getNome() + " antes."));

        boolean possuiAtiva = matriculaRepository.findByAlunoLogin(aluno.getLogin()).stream()
                .filter(m -> m.getMateria().getId().equals(dados.getIdMateria()))
                .anyMatch(m -> {
                    String statusAtual = m.getStatus(); 
                    return statusAtual.equals("CURSANDO") || statusAtual.equals("APROVADO") || statusAtual.equals("RECUPERACAO");
                });

        if (possuiAtiva) {
            throw new RuntimeException("Aluno já possui uma matrícula ativa ou concluída nesta disciplina.");
        }

        var novaMatricula = new Matricula(aluno, materia, vinculoCurso);
        matriculaRepository.save(novaMatricula);
    }

    @SuppressWarnings("null")
    public Matricula buscarPorId(Long id) {
        return matriculaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Matrícula não encontrada"));
    }

    /**
     * LANÇAR NOTA (Nova Lógica para múltiplas provas)
     */
    @SuppressWarnings("null")
    @Transactional
    public void lancarNota(DadosLancamentoNota dados, String loginProfessorLogado) {
        var matricula = matriculaRepository.findById(dados.getIdMatricula())
                .orElseThrow(() -> new RuntimeException("Matrícula não encontrada"));

        if (matricula.getMateria().isEncerrada()) {
            throw new RuntimeException("Esta matéria já foi finalizada. Não é possível alterar notas.");
        }

        if (!matricula.getMateria().getProfessor().getLogin().equals(loginProfessorLogado)) {
            throw new RuntimeException("Você não leciona esta matéria.");
        }

        ConfiguracaoAvaliacao configuracao = configuracaoRepository.findById(dados.getIdConfiguracao())
                .orElseThrow(() -> new RuntimeException("Configuração de avaliação não encontrada."));

        if (!configuracao.getMateria().getId().equals(matricula.getMateria().getId())) {
             throw new RuntimeException("Esta avaliação não pertence à matéria desta matrícula.");
        }

        Optional<Nota> notaExistente = notaRepository.findByMatriculaIdAndConfiguracaoId(matricula.getId(), configuracao.getId());

        if (notaExistente.isPresent()) {
            Nota nota = notaExistente.get();
            nota.setValor(dados.getNota());
            notaRepository.save(nota);
        } else {
            Nota novaNota = new Nota(matricula, configuracao, dados.getNota());
            notaRepository.save(novaNota);
        }
    }

    // --- MÉTODOS DE LISTAGEM (GET) ---

    public List<DadosListagemMatriculaMateria> listarMatriculas(Usuario usuario) {
        return switch (usuario.getTipo()) {
            case ALUNO -> 
                matriculaRepository.findByAlunoLogin(usuario.getLogin())
                        .stream().map(DadosListagemMatriculaMateria::new).toList();
            
            case PROFESSOR -> 
                matriculaRepository.findByMateriaProfessorLogin(usuario.getLogin())
                        .stream().map(DadosListagemMatriculaMateria::new).toList();
            
            case INSTITUICAO -> 
                matriculaRepository.findAll()
                        .stream().map(DadosListagemMatriculaMateria::new).toList();
        };
    }

    public List<DadosListagemMatriculaMateria> listarMatriculasPorCurso(Long idCurso) {
        return matriculaRepository.findByMateriaCursoId(idCurso).stream()
                .map(DadosListagemMatriculaMateria::new)
                .toList();
    }

    public List<DadosListagemMatriculaCurso> listarCursosPorAluno(Long idAluno) {
        return matriculaCursoRepository.findByAlunoId(idAluno).stream()
                .map(DadosListagemMatriculaCurso::new)
                .toList();
    }

    @SuppressWarnings("null")
    @Transactional
    public void cancelarMatriculaMateria(Long id) {
        if (!matriculaRepository.existsById(id)) {
            throw new RuntimeException("Matrícula em disciplina não encontrada.");
        }
        matriculaRepository.deleteById(id);
    }

    @SuppressWarnings("null")
    @Transactional
    public void cancelarMatriculaCurso(Long id) {
        if (!matriculaCursoRepository.existsById(id)) {
            throw new RuntimeException("Matrícula de curso não encontrada.");
        }
        matriculaCursoRepository.deleteById(id);
    }
}