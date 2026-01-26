package br.com.matricula.dto;

import java.util.List;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class DadosCadastroMateria {

    @NotBlank private String nome;
    @NotBlank private String descricao;
    @NotNull private Long idCurso;
    @NotNull private Long idProfessor;
    private List<DadosConfiguracao> avaliacoes; 

    public DadosCadastroMateria() {}

    public DadosCadastroMateria(String nome, String descricao, Long idCurso, Long idProfessor, List<DadosConfiguracao> avaliacoes) {
        this.nome = nome;
        this.descricao = descricao;
        this.idCurso = idCurso;
        this.idProfessor = idProfessor;
        this.avaliacoes = avaliacoes;
    }

    // Getters e Setters
    public String getNome() { return nome;}
    public void setNome(String nome) {this.nome = nome;}
    public String getDescricao() {return descricao;}
    public void setDescricao(String descricao) {this.descricao = descricao;}
    public Long getIdCurso() {return idCurso;}
    public void setIdCurso(Long idCurso) {this.idCurso = idCurso;}
    public Long getIdProfessor() {return idProfessor;}
    public void setIdProfessor(Long idProfessor) {this.idProfessor = idProfessor;}
    public List<DadosConfiguracao> getAvaliacoes() { return avaliacoes; }
    public void setAvaliacoes(List<DadosConfiguracao> avaliacoes) { this.avaliacoes = avaliacoes; }
}