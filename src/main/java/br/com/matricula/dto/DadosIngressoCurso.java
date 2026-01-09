package br.com.matricula.dto;

import jakarta.validation.constraints.NotNull;

public class DadosIngressoCurso {

    @NotNull 
    private Long idAluno;
    
    @NotNull 
    private Long idCurso;

    public DadosIngressoCurso() {}

    public DadosIngressoCurso(Long idAluno, Long idCurso) {
        this.idAluno = idAluno;
        this.idCurso = idCurso;
    }

    public Long getIdAluno() { return idAluno; }
    public void setIdAluno(Long idAluno) { this.idAluno = idAluno; }
    public Long getIdCurso() { return idCurso; }
    public void setIdCurso(Long idCurso) { this.idCurso = idCurso; }
}