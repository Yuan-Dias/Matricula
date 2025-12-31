package br.com.matricula.dto;

import br.com.matricula.model.Matricula;
import java.time.LocalDateTime;

public class DadosListagemMatricula {

    private Long id;
    private String nomeAluno;
    private String nomeMateria;
    private String nomeCurso;
    private Double nota;
    private LocalDateTime data;

    public DadosListagemMatricula() {}

    public DadosListagemMatricula(Matricula matricula) {
        this.id = matricula.getId();
        this.nomeAluno = matricula.getAluno().getNome();
        this.nomeMateria = matricula.getMateria().getNome();
        this.nomeCurso = matricula.getMateria().getCurso().getNome();
        this.nota = matricula.getNota();
        this.data = matricula.getDataMatricula();
    }

    public Long getId() {return id;}
    public void setId(Long id) {this.id = id;}
    public String getNomeAluno() {return nomeAluno;}
    public void setNomeAluno(String nomeAluno) {this.nomeAluno = nomeAluno;}
    public String getNomeMateria() {return nomeMateria;}
    public void setNomeMateria(String nomeMateria) {this.nomeMateria = nomeMateria;}
    public String getNomeCurso() {return nomeCurso;}
    public void setNomeCurso(String nomeCurso) {this.nomeCurso = nomeCurso;}
    public Double getNota() {return nota;}
    public void setNota(Double nota) {this.nota = nota;}
    public LocalDateTime getData() {return data;}
    public void setData(LocalDateTime data) {this.data = data;}
}