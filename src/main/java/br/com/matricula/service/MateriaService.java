package br.com.matricula.service;

import br.com.matricula.dto.*;
import br.com.matricula.model.*;
import br.com.matricula.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class MateriaService {

    @Autowired
    private MateriaRepository repository;

    @Autowired
    private CursoRepository cursoRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    /**
     * CADASTRAR MATÉRIA
     * Valida se o curso existe e se o professor indicado realmente tem perfil de PROFESSOR.
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
    }

    /**
     * LISTAGEM GENÉRICA
     * Retorna todas as matérias de todos os cursos.
     */
    public List<DadosListagemMateria> listarTodas() {
        return repository.findAll().stream()
                .map(DadosListagemMateria::new)
                .toList();
    }

    /**
     * LISTAGEM ESPECÍFICA
     * Retorna as matérias de um curso específico (ex: todas as matérias de "Engenharia").
     */
    public List<DadosListagemMateria> listarPorCurso(Long idCurso) {
        return repository.findByCursoId(idCurso).stream()
                .map(DadosListagemMateria::new)
                .toList();
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
        // Nota: Geralmente não se altera o curso de uma matéria após criada, 
        // mas se necessário, adicione cursoRepository.findById aqui.

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
}