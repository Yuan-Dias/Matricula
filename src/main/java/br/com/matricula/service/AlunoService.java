package br.com.matricula.service;

import br.com.matricula.dto.DadosAluno;
import br.com.matricula.model.Aluno;
import br.com.matricula.repository.AlunoRepository;
import br.com.matricula.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class AlunoService {

    @Autowired
    private AlunoRepository repository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    /**
     * Cadastra um novo aluno no sistema.
     * Realiza a limpeza do CPF e garante que o e-mail seja único na tabela de usuários.
     */
    @Transactional
    public Aluno cadastrar(DadosAluno dados) {
        String emailPadrao = dados.getEmail().trim().toLowerCase();

        // Verifica se o login (e-mail) já existe na base de usuários geral
        if (usuarioRepository.findByLogin(emailPadrao) != null) {
            throw new RuntimeException("Erro: Este e-mail já está cadastrado no sistema.");
        }

        Aluno aluno = new Aluno(dados);
        aluno.setEmail(emailPadrao);
        aluno.setLogin(emailPadrao); // O e-mail é usado como login para autenticação
        
        // Remove qualquer caractere não numérico do CPF antes de salvar
        aluno.setCpf(dados.getCpf().replaceAll("\\D", ""));
        
        // Criptografa a senha antes de persistir no banco
        aluno.setSenha(passwordEncoder.encode(dados.getSenha()));

        return repository.save(aluno);
    }

    /**
     * Retorna a lista de todos os alunos cadastrados.
     */
    public List<Aluno> listar() {
        return repository.findAll();
    }

    /**
     * Atualiza os dados de um aluno existente.
     * Inclui verificação de disponibilidade de e-mail e re-criptografia de senha.
     */
    @SuppressWarnings("null")
    @Transactional
    public Aluno atualizar(Long id, DadosAluno dados) {
        Aluno aluno = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Aluno não encontrado com o ID: " + id));

        String novoEmail = dados.getEmail().trim().toLowerCase();

        // Se o e-mail mudou, verifica se o novo já não está em uso por outro usuário
        if (!aluno.getEmail().equals(novoEmail) && usuarioRepository.findByLogin(novoEmail) != null) {
            throw new RuntimeException("Erro: O novo e-mail informado já está em uso.");
        }

        aluno.setNome(dados.getNome());
        aluno.setEmail(novoEmail);
        aluno.setLogin(novoEmail);
        aluno.setCpf(dados.getCpf().replaceAll("\\D", ""));

        // Se uma nova senha foi enviada, ela deve ser codificada
        if (dados.getSenha() != null && !dados.getSenha().isBlank()) {
            aluno.setSenha(passwordEncoder.encode(dados.getSenha()));
        }

        return repository.save(aluno);
    }

    /**
     * Remove um aluno do sistema pelo ID.
     */
    @SuppressWarnings("null")
    @Transactional
    public void excluir(Long id) {
        if (!repository.existsById(id)) {
            throw new RuntimeException("Erro: Aluno não encontrado para exclusão.");
        }
        repository.deleteById(id);
    }
}