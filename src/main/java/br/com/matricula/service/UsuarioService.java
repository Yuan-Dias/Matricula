package br.com.matricula.service;

import java.util.List;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.matricula.dto.DadosCadastro;
import br.com.matricula.dto.DadosListagemUsuario;
import br.com.matricula.model.TipoUsuario;
import br.com.matricula.model.Usuario;
import br.com.matricula.repository.UsuarioRepository;

@Service
public class UsuarioService {

    private final UsuarioRepository repository;
    private final PasswordEncoder passwordEncoder;

    public UsuarioService(UsuarioRepository repository, PasswordEncoder passwordEncoder) {
        this.repository = repository;
        this.passwordEncoder = passwordEncoder;
    }

    /**
     * CADASTRO GERAL
     * Inclui a regra de negócio para o primeiro usuário e proteção de login duplicado.
     */
    @Transactional
    public Usuario cadastrar(DadosCadastro dados) {
        String loginLimpo = dados.getLogin().trim().toLowerCase();
        
        // Regra específica: O primeiro usuário deve ser a Instituição para gerenciar o sistema
        boolean sistemaVazio = repository.count() == 0;
        if (sistemaVazio && dados.getTipo() != TipoUsuario.INSTITUICAO) {
            throw new RuntimeException("O primeiro usuário do sistema deve ser do tipo INSTITUICAO.");
        }

        // Validação de duplicidade
        if (repository.findByLogin(loginLimpo) != null) {
            throw new RuntimeException("Erro: Login já em uso.");
        }

        if (dados.getTipo() == TipoUsuario.ALUNO) {
            throw new RuntimeException("Para cadastrar ALUNO, utilize o formulário específico de alunos.");
        }

        Usuario novoUsuario = new Usuario();
        novoUsuario.setLogin(loginLimpo);
        novoUsuario.setNome(dados.getNome().trim());
        novoUsuario.setTipo(dados.getTipo());
        novoUsuario.setSenha(passwordEncoder.encode(dados.getSenha()));

        return repository.save(novoUsuario);
    }

    /**
     * LISTAGEM GERAL
     */
    public List<DadosListagemUsuario> listarTodos() {
        return repository.findAllAsDto();
    }
    /**
     * LISTAGEM ESPECÍFICA (Por tipo: PROFESSOR, ALUNO ou INSTITUICAO)
     */
    public List<DadosListagemUsuario> listarPorTipo(TipoUsuario tipo) {
        return repository.findByTipoAsDto(tipo);
    }
    /**
     * ATUALIZAÇÃO GERAL
     * Permite atualizar nome, login (com validação) e senha (com nova criptografia).
     */
    @SuppressWarnings("null")
    @Transactional
    public Usuario atualizar(Long id, DadosCadastro dados) {
        @SuppressWarnings("null")
        var user = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        if (dados.getNome() != null && !dados.getNome().isBlank()) {
            user.setNome(dados.getNome().trim());
        }
        
        if (dados.getLogin() != null && !dados.getLogin().isBlank()) {
            String novoLogin = dados.getLogin().trim().toLowerCase();
            // Verifica se o login mudou e se o novo já existe para outra pessoa
            if (!novoLogin.equals(user.getLogin()) && repository.findByLogin(novoLogin) != null) {
                throw new RuntimeException("Novo login já está em uso.");
            }
            user.setLogin(novoLogin);
        }

        // Atualiza a senha apenas se uma nova for enviada
        if (dados.getSenha() != null && !dados.getSenha().isBlank()) {
            user.setSenha(passwordEncoder.encode(dados.getSenha()));
        }

        return repository.save(user);
    }

    /**
     * EXCLUSÃO GERAL
     */
    @SuppressWarnings("null")
    @Transactional
    public void excluir(Long id) {
        if (!repository.existsById(id)) {
            throw new RuntimeException("Usuário não encontrado");
        }
        repository.deleteById(id);
    }
}