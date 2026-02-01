package br.com.matricula.service;

import java.time.LocalDateTime;
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
import br.com.matricula.model.StatusMatricula;
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

    /**
     * REALIZAR MATRÍCULA EM DISCIPLINA
     * Lógica Inteligente: Cria nova ou Reativa antiga (se reprovado)
     */
    @SuppressWarnings("null")
    @Transactional
    public void matricularNaMateria(DadosMatricula dados, Usuario usuarioLogado) {
        // Validação de segurança básica
        if (usuarioLogado.getTipo() == TipoUsuario.ALUNO && !usuarioLogado.getId().equals(dados.getIdAluno())) {
            throw new RuntimeException("Um aluno não pode matricular outro aluno.");
        }

        var aluno = alunoRepository.findById(dados.getIdAluno())
                .orElseThrow(() -> new RuntimeException("Aluno não encontrado"));
        
        var materia = materiaRepository.findById(dados.getIdMateria())
                .orElseThrow(() -> new RuntimeException("Matéria não encontrada"));

        // Verifica vínculo com o curso principal
        var vinculoCurso = matriculaCursoRepository
                .findByAlunoIdAndCursoId(aluno.getId(), materia.getCurso().getId())
                .stream().findFirst()
                .orElseThrow(() -> new RuntimeException("O aluno deve estar matriculado no curso " + materia.getCurso().getNome() + " antes."));

        // BUSCA MATRÍCULA EXISTENTE (Se houver)
        Optional<Matricula> matriculaExistente = matriculaRepository.findByAlunoLogin(aluno.getLogin()).stream()
                .filter(m -> m.getMateria().getId().equals(dados.getIdMateria()))
                .findFirst();

        if (matriculaExistente.isPresent()) {
            Matricula m = matriculaExistente.get();
            StatusMatricula status = m.getStatus();

            // CENÁRIO 1: Já está cursando ou já passou -> ERRO
            if (status == StatusMatricula.CURSANDO || status == StatusMatricula.RECUPERACAO) {
                throw new RuntimeException("Aluno já possui uma matrícula ativa nesta disciplina.");
            }
            if (status == StatusMatricula.APROVADO) {
                throw new RuntimeException("Aluno já foi aprovado nesta disciplina.");
            }

            // CENÁRIO 2: Reprovado ou Cancelado -> REATIVAR (Refazer matéria)
            // Aqui fazemos o UPDATE em vez de tentar criar novo (que daria erro de duplicidade)
            m.setStatus(StatusMatricula.CURSANDO);
            m.setAtiva(true);
            m.setNotaFinal(null); // Limpa média anterior
            m.setDataMatricula(LocalDateTime.now()); // Atualiza data de início para hoje
            
            // Limpa as notas antigas para começar do zero
            if (m.getNotasLancadas() != null) {
                m.getNotasLancadas().clear();
            }
            
            matriculaRepository.save(m);
            return; // Sai do método com sucesso
        }

        // CENÁRIO 3: Nunca cursou -> CRIA NOVA
        var novaMatricula = new Matricula(aluno, materia, vinculoCurso);
        matriculaRepository.save(novaMatricula);
    }

    @SuppressWarnings("null")
    public Matricula buscarPorId(Long id) {
        return matriculaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Matrícula não encontrada"));
    }

    /**
     * LANÇAR NOTA 
     */
    @SuppressWarnings("null")
    @Transactional
    public void lancarNota(DadosLancamentoNota dados, String loginProfessorLogado) {
        var matricula = matriculaRepository.findById(dados.getIdMatricula())
                .orElseThrow(() -> new RuntimeException("Matrícula não encontrada"));

        if (matricula.getStatus() == StatusMatricula.HISTORICO) { // ou verifique se !ativa
            throw new RuntimeException("Esta matrícula já foi consolidada no histórico e não pode ser alterada.");
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

        if (dados.getNota() == null) {
            if (notaExistente.isPresent()) {
                notaRepository.delete(notaExistente.get());
            }
        } else {
            if (notaExistente.isPresent()) {
                Nota nota = notaExistente.get();
                nota.setValor(dados.getNota());
                notaRepository.save(nota);
            } else {
                Nota novaNota = new Nota(matricula, configuracao, dados.getNota());
                notaRepository.save(novaNota);
            }
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
        
        // Opcional: Se quiser permitir que o aluno cancele e isso fique registrado
        // em vez de deletar, altere para:
        // Matricula m = buscarPorId(id);
        // m.setStatus(StatusMatricula.CANCELADO);
        // m.setAtiva(false);
        // matriculaRepository.save(m);
        
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