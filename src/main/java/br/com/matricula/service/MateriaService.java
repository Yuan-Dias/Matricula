package br.com.matricula.service;

import br.com.matricula.dto.*;
import br.com.matricula.model.*;
import br.com.matricula.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class MateriaService {

    private final MateriaRepository repository;
    private final CursoRepository cursoRepository;
    private final UsuarioRepository usuarioRepository;
    private final ConfiguracaoAvaliacaoRepository configuracaoAvaliacaoRepository;
    private final MatriculaRepository matriculaRepository;

    public MateriaService(MateriaRepository repository, CursoRepository cursoRepository, UsuarioRepository usuarioRepository, ConfiguracaoAvaliacaoRepository configuracaoAvaliacaoRepository, MatriculaRepository matriculaRepository) {
        this.repository = repository;
        this.cursoRepository = cursoRepository;
        this.usuarioRepository = usuarioRepository;
        this.configuracaoAvaliacaoRepository = configuracaoAvaliacaoRepository;
        this.matriculaRepository = matriculaRepository;
    }

    /**
     * CADASTRAR MATÉRIA
     */
    @Transactional
    public void cadastrar(DadosCadastroMateria dados) {
        @SuppressWarnings("null")
        var curso = cursoRepository.findById(dados.getIdCurso())
                .orElseThrow(() -> new RuntimeException("Curso não encontrado."));

        @SuppressWarnings("null")
        var professor = usuarioRepository.findById(dados.getIdProfessor())
                .orElseThrow(() -> new RuntimeException("Professor não encontrado."));

        if (professor.getTipo() != TipoUsuario.PROFESSOR) {
            throw new RuntimeException("O usuário selecionado deve ter o perfil de PROFESSOR.");
        }

        var materia = new Materia(
                dados.getNome(),
                dados.getDescricao(),
                curso,
                professor
        );

        repository.save(materia);

        if (dados.getAvaliacoes() != null && !dados.getAvaliacoes().isEmpty()) {
            for (DadosConfiguracao config : dados.getAvaliacoes()) {
                ConfiguracaoAvaliacao novaConfig = new ConfiguracaoAvaliacao(config, materia);
                configuracaoAvaliacaoRepository.save(novaConfig);
            }
        }
    }

    /**
     * LISTAGEM GENÉRICA
     */
    @Transactional(readOnly = true)
    public List<DadosListagemMateria> listarTodas() {
        return repository.findAll().stream()
                .map(DadosListagemMateria::new)
                .toList();
    }

    /**
     * LISTAGEM ESPECÍFICA
     */
    @Transactional(readOnly = true)
    public List<DadosListagemMateria> listarPorCurso(Long idCurso) {
        return repository.findByCursoId(idCurso).stream()
                .map(DadosListagemMateria::new)
                .toList();
    }

    /**
     * LISTAR AVALIAÇÕES DE UMA MATÉRIA
    */
    public List<DadosConfiguracao> listarAvaliacoesPorMateria(Long idMateria) {
        return configuracaoAvaliacaoRepository.findByMateriaId(idMateria).stream()
                .map(DadosConfiguracao::new)
                .toList();
    }

    /**
     * LISTAR POR PROFESSOR
     */
    @Transactional(readOnly = true)
    public List<DadosListagemMateria> listarPorProfessor(Long idProfessor) {
        return repository.findByProfessorId(idProfessor).stream()
                .map(DadosListagemMateria::new)
                .toList();
    }

    /**
     * DETALHAR MATÉRIA
     */
    @Transactional(readOnly = true)
    public DadosListagemMateria detalhar(Long id) {
        @SuppressWarnings("null")
        var materia = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Matéria não encontrada."));

        return new DadosListagemMateria(materia);
    }

    /**
     * ATUALIZAR MATÉRIA
     */
    @Transactional
    public DadosListagemMateria atualizar(Long id, DadosCadastroMateria dados) {
        @SuppressWarnings("null")
        var materia = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Matéria não encontrada."));

        @SuppressWarnings("null")
        var professor = usuarioRepository.findById(dados.getIdProfessor())
                .orElseThrow(() -> new RuntimeException("Professor não encontrado."));

        if (professor.getTipo() != TipoUsuario.PROFESSOR) {
            throw new RuntimeException("O usuário selecionado deve ser do tipo PROFESSOR.");
        }

        materia.setNome(dados.getNome());
        materia.setDescricao(dados.getDescricao());
        materia.setProfessor(professor);

        repository.save(materia);
        return new DadosListagemMateria(materia);
    }

    /**
     * EXCLUIR MATÉRIA
     */
    @SuppressWarnings("null")
    @Transactional
    public void excluir(Long id) {
        if (!repository.existsById(id)) {
            throw new RuntimeException("Matéria não encontrada para exclusão.");
        }
        repository.deleteById(id);
    }

    @SuppressWarnings("null")
    @Transactional
    public void atualizarConfiguracaoAvaliacoes(Long idMateria, List<DadosConfiguracao> novasConfigs) {
        @SuppressWarnings("null")
        Materia materia = repository.findById(idMateria)
                .orElseThrow(() -> new RuntimeException("Matéria não encontrada."));

        List<ConfiguracaoAvaliacao> antigas = configuracaoAvaliacaoRepository.findByMateriaId(idMateria);
        configuracaoAvaliacaoRepository.deleteAll(antigas);

        configuracaoAvaliacaoRepository.flush();

        if (novasConfigs != null && !novasConfigs.isEmpty()) {
            for (DadosConfiguracao dados : novasConfigs) {
                ConfiguracaoAvaliacao novaConfig = new ConfiguracaoAvaliacao(dados, materia);
                configuracaoAvaliacaoRepository.save(novaConfig);
            }
        }
    }

    @Transactional
    public void finalizarSemestre(Long idMateria, String loginProfessor) {
        @SuppressWarnings("null")
        Materia materia = repository.findById(idMateria)
                .orElseThrow(() -> new RuntimeException("Matéria não encontrada."));

        if (!materia.getProfessor().getLogin().equals(loginProfessor)) {
            throw new RuntimeException("Apenas o professor da matéria pode encerrá-la.");
        }

        materia.setEncerrada(true);
        repository.save(materia);

        List<Matricula> alunos = matriculaRepository.findByMateriaId(idMateria);

        for (Matricula m : alunos) {
            double media = m.getMediaFinal();
            m.setNotaFinal(media);

            // Define o status final baseado na sua regra de negócio
            if (media >= 7.0) {
                m.setStatus(StatusMatricula.APROVADO);
            } else {
                m.setStatus(StatusMatricula.REPROVADO);
            }
        }
    }
}