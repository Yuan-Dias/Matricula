package br.com.matricula.dto;

import br.com.matricula.model.Matricula;

import java.time.LocalDateTime;
import java.util.Optional;

public class DadosListagemMatriculaMateria {

    private Long id;
    private Long idAluno;
    private String nomeAluno;
    private Long idMateria;
    private String nomeMateria;
    private String nomeCurso;
    private Double nota;
    private LocalDateTime data;

    public DadosListagemMatriculaMateria() {}

    public DadosListagemMatriculaMateria(Matricula matricula) {
        this.id = matricula.getId();
        this.idAluno = matricula.getAluno().getId();
        this.nomeAluno = matricula.getAluno().getNome();
        this.idMateria = matricula.getMateria().getId();
        this.nomeMateria = matricula.getMateria().getNome();
        this.nomeCurso = matricula.getMateria().getCurso().getNome();
        this.nota = Optional.ofNullable(matricula.getNota()).orElse(0.0);        
        this.data = matricula.getDataMatricula();
    }

    public Long getId() {return id;}
    public void setId(Long id) {this.id = id;}
    public Long getIdAluno() {return idAluno;}
    public void setIdAluno(Long idAluno) {this.idAluno = idAluno;}
    public String getNomeAluno() {return nomeAluno;}
    public void setNomeAluno(String nomeAluno) {this.nomeAluno = nomeAluno;}
    public Long getIdMateria() {return idMateria;}
    public void setIdMateria(Long idMateria) {this.idMateria = idMateria;}
    public String getNomeMateria() {return nomeMateria;}
    public void setNomeMateria(String nomeMateria) {this.nomeMateria = nomeMateria;}
    public String getNomeCurso() {return nomeCurso;}
    public void setNomeCurso(String nomeCurso) {this.nomeCurso = nomeCurso;}
    public Double getNota() {return nota;}
    public void setNota(Double nota) {this.nota = nota;}
    public LocalDateTime getData() {return data;}
    public void setData(LocalDateTime data) {this.data = data;}
}