package br.com.matricula.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

public class DadosLancamentoNota {

    @NotNull private Long idMatricula;

    @NotNull
    @DecimalMin("0.0")
    @DecimalMax("10.0")
    private Double nota;

    public DadosLancamentoNota() {}

    public Long getIdMatricula() {return idMatricula;}
    public void setIdMatricula(Long idMatricula) {this.idMatricula = idMatricula;}
    public Double getNota() {return nota;}
    public void setNota(Double nota) {this.nota = nota;}
}