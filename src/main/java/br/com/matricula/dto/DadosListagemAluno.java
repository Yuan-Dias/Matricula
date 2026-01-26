package br.com.matricula.dto;

import br.com.matricula.model.Aluno;

public class DadosListagemAluno {

    private final Long id;
    private final String nome;
    private final String cpf;
    private final String email;

    // Construtor que recebe a Entidade
    public DadosListagemAluno(Aluno aluno) {
        this.id = aluno.getId();
        this.nome = aluno.getNome();
        this.cpf = aluno.getCpf();
        this.email = aluno.getEmail();
    }

    // --- GETTERS (Obrigatórios) ---
    public Long getId() { return id; }
    public String getNome() { return nome; }
    public String getCpf() { return cpf; }
    public String getEmail() { return email; }
}