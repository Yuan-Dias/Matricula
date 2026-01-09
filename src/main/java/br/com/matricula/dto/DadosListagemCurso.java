package br.com.matricula.dto;

import br.com.matricula.model.Curso;

public class DadosListagemCurso {
    private Long id;
    private String nome;
    private String descricao;
    private int cargaHoraria;
    private int capacidade;
    private String nomeProfessor;

    // Construtor padrão necessário para serialização
    public DadosListagemCurso() {}

    // Construtor para converter a Entidade em DTO
    public DadosListagemCurso(Curso curso) {
        this.id = curso.getId();
        this.nome = curso.getNome();
        this.descricao = curso.getDescricao();
        this.cargaHoraria = curso.getCargaHoraria();
        this.capacidade = curso.getCapacidade();
        if (curso.getProfessor() != null) {
            this.nomeProfessor = curso.getProfessor().getNome();
        } else {
            this.nomeProfessor = "Não atribuído";
        }
    }

    // Getters e Setters Clássicos
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }

    public String getDescricao() { return descricao; }
    public void setDescricao(String descricao) { this.descricao = descricao; }

    public int getCargaHoraria() { return cargaHoraria; }
    public void setCargaHoraria(int cargaHoraria) { this.cargaHoraria = cargaHoraria; }

    public int getCapacidade() { return capacidade; }
    public void setCapacidade(int capacidade) { this.capacidade = capacidade; }

    public String getNomeProfessor() { return nomeProfessor; }
    public void setNomeProfessor(String nomeProfessor) { this.nomeProfessor = nomeProfessor; }
}