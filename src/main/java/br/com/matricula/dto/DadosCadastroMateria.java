package br.com.matricula.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class DadosCadastroMateria {

    @NotBlank private String nome;
    @NotBlank private String descricao;
    @NotNull private Long idCurso;
    @NotNull private Long idProfessor;

    public DadosCadastroMateria() {}

    public DadosCadastroMateria(String nome, String descricao, Long idCurso, Long idProfessor) {
        this.nome = nome;
        this.descricao = descricao;
        this.idCurso = idCurso;
        this.idProfessor = idProfessor;
    }

    public String getNome() { return nome;}
    public void setNome(String nome) {this.nome = nome;}
    public String getDescricao() {return descricao;}
    public void setDescricao(String descricao) {this.descricao = descricao;}
    public Long getIdCurso() {return idCurso;}
    public void setIdCurso(Long idCurso) {this.idCurso = idCurso;}
    public Long getIdProfessor() {return idProfessor;}
    public void setIdProfessor(Long idProfessor) {this.idProfessor = idProfessor;}
}