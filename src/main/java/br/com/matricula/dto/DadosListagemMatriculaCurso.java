package br.com.matricula.dto;

import br.com.matricula.model.MatriculaCurso;

public class DadosListagemMatriculaCurso {
    private Long id;
    private Long idCurso;
    private String nomeCurso;
    private String nomeAluno;

    public DadosListagemMatriculaCurso() {}

    public DadosListagemMatriculaCurso(MatriculaCurso matricula) {
        this.id = matricula.getId();
        this.idCurso = matricula.getCurso().getId();
        this.nomeCurso = matricula.getCurso().getNome();
        this.nomeAluno = matricula.getAluno().getNome();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getIdCurso() { return idCurso; }
    public void setIdCurso(Long idCurso) { this.idCurso = idCurso; }
    public String getNomeCurso() { return nomeCurso; }
    public void setNomeCurso(String nomeCurso) { this.nomeCurso = nomeCurso; }
    public String getNomeAluno() { return nomeAluno; }
    public void setNomeAluno(String nomeAluno) { this.nomeAluno = nomeAluno; }
}