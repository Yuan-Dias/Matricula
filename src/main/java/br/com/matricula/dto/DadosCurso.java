package br.com.matricula.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class DadosCurso {

    @NotBlank private String nome;
    @NotBlank private String descricao;
    @NotNull private Integer cargaHoraria;
    @NotNull private Integer capacidade;
    @NotNull private Long idProfessor;

    public DadosCurso() {}

    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }
    public String getDescricao() { return descricao; }
    public void setDescricao(String descricao) { this.descricao = descricao; }
    public Integer getCargaHoraria() { return cargaHoraria; }
    public void setCargaHoraria(Integer cargaHoraria) { this.cargaHoraria = cargaHoraria; }
    public Integer getCapacidade() { return capacidade; }
    public void setCapacidade(Integer capacidade) { this.capacidade = capacidade; }
    public Long getIdProfessor() { return idProfessor; }
    public void setIdProfessor(Long idProfessor) { this.idProfessor = idProfessor; }
}