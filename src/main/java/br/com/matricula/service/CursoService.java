package br.com.matricula.service;

import br.com.matricula.dto.DadosCurso;
import br.com.matricula.dto.DadosListagemCurso;
import br.com.matricula.model.Curso;
import br.com.matricula.model.TipoUsuario;
import br.com.matricula.model.Usuario;
import br.com.matricula.repository.CursoRepository;
import br.com.matricula.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class CursoService {

    @Autowired
    private CursoRepository repository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    // CADASTRAR CURSO
    @Transactional
    public void cadastrar(DadosCurso dados) {
        Usuario professor = buscarProfessor(dados.getIdProfessor());
        
        // Criando a entidade através do DTO e o objeto Professor já validado
        var curso = new Curso(dados, professor);
        repository.save(curso);
    }

    // LISTAR TODOS (Retorna DTO para evitar recursão de JSON)
    public List<DadosListagemCurso> listarTodos() {
        return repository.findAll()
                .stream()
                .map(DadosListagemCurso::new)
                .toList();
    }

    // ATUALIZAR CURSO
    @Transactional
    public DadosListagemCurso atualizar(Long id, DadosCurso dados) {
        @SuppressWarnings("null")
        var curso = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Curso não encontrado com o ID: " + id));

        Usuario professor = buscarProfessor(dados.getIdProfessor());

        curso.setNome(dados.getNome());
        curso.setDescricao(dados.getDescricao());
        curso.setCargaHoraria(dados.getCargaHoraria());
        curso.setCapacidade(dados.getCapacidade());
        curso.setProfessor(professor);

        repository.save(curso);
        return new DadosListagemCurso(curso);
    }

    // EXCLUIR CURSO
    @SuppressWarnings("null")
    @Transactional
    public void excluir(Long id) {
        if (!repository.existsById(id)) {
            throw new RuntimeException("Não foi possível excluir: Curso não encontrado.");
        }
        repository.deleteById(id);
    }

    // MÉTODO AUXILIAR DE VALIDAÇÃO (Privado para uso interno da Service)
    private Usuario buscarProfessor(Long idProfessor) {
        @SuppressWarnings("null")
        var professor = usuarioRepository.findById(idProfessor)
                .orElseThrow(() -> new RuntimeException("Professor informado não existe (ID inválido)"));

        if (professor.getTipo() != TipoUsuario.PROFESSOR) {
            throw new RuntimeException("O usuário informado deve ser do tipo PROFESSOR.");
        }
        
        return professor;
    }
}