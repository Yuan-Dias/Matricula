package br.com.matricula.dto;

import br.com.matricula.model.Materia;
import java.util.List;
import java.util.ArrayList;

public class DadosListagemMateria {
    private Long id;
    private String nome;
    private String descricao;
    private String nomeCurso;
    private String nomeProfessor;
    private boolean encerrada;
    
    private List<DadosConfiguracao> avaliacoes;

    public DadosListagemMateria() {}

    public DadosListagemMateria(Materia materia) {
        this.id = materia.getId();
        this.nome = materia.getNome();
        this.descricao = materia.getDescricao();        
        this.nomeCurso = (materia.getCurso() != null) ? materia.getCurso().getNome() : "Sem curso";
        this.nomeProfessor = (materia.getProfessor() != null) ? materia.getProfessor().getNome() : "Não atribuído";

        if (materia.getConfiguracoes() != null) {
            this.avaliacoes = materia.getConfiguracoes().stream()
                .map(DadosConfiguracao::new)
                .toList();
        } else {
            this.avaliacoes = new ArrayList<>();
        }

        this.encerrada = materia.isEncerrada();
    }

    // --- Getters e Setters ---
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

    public List<DadosConfiguracao> getAvaliacoes() { return avaliacoes; }
    public void setAvaliacoes(List<DadosConfiguracao> avaliacoes) { this.avaliacoes = avaliacoes; }

    public boolean isEncerrada() { return encerrada; }
    public void setEncerrada(boolean encerrada) { this.encerrada = encerrada; }
}