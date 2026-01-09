package br.com.matricula.dto;

import br.com.matricula.model.Materia;

public class DadosListagemMateria {
    private Long id;
    private String nome;
    private String descricao;
    private String nomeCurso;
    private String nomeProfessor;

    public DadosListagemMateria() {}

    public DadosListagemMateria(Materia materia) {
        this.id = materia.getId();
        this.nome = materia.getNome();
        this.descricao = materia.getDescricao();
        
        this.nomeCurso = (materia.getCurso() != null) ? materia.getCurso().getNome() : "Sem curso";
        this.nomeProfessor = (materia.getProfessor() != null) ? materia.getProfessor().getNome() : "Não atribuído";
    }

    // Getters e Setters Clássicos
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }
    public String getDescricao() { return descricao; }
    public void setDescricao(String descricao) { this.descricao = descricao; }
    public String getNomeCurso() { return nomeCurso; }
    public void setNomeCurso(String nomeCurso) { this.nomeCurso = nomeCurso; }
    public String getNomeProfessor() { return nomeProfessor; }
    public void setNomeProfessor(String nomeProfessor) { this.nomeProfessor = nomeProfessor; }
}