package br.com.matricula.dto;
import jakarta.validation.constraints.NotNull;

public class DadosMatricula {

    @NotNull private Long idAluno;
    @NotNull private Long idMateria;

    public DadosMatricula() {}

    public DadosMatricula(Long idAluno, Long idMateria) {
        this.idAluno = idAluno;
        this.idMateria = idMateria;
    }

    public Long getIdAluno() {return idAluno;}
    public void setIdAluno(Long idAluno) {this.idAluno = idAluno;}
    public Long getIdMateria() {return idMateria;}
    public void setIdMateria(Long idMateria) {this.idMateria = idMateria;}
}