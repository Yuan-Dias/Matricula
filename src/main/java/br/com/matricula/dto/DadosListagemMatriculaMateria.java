package br.com.matricula.dto;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import br.com.matricula.model.Matricula;

public class DadosListagemMatriculaMateria {

    private Long id;
    private Long idAluno;
    private String nomeAluno;
    private Long idMateria;
    private String nomeMateria;
    private String nomeCurso;
    private Double mediaFinal;
    private String situacao;
    private LocalDateTime data;
    private List<DadosNota> notas = new ArrayList<>();
    private boolean ativa;

    public DadosListagemMatriculaMateria() {}

    public DadosListagemMatriculaMateria(Matricula matricula) {
        this.id = matricula.getId();
        this.idAluno = matricula.getAluno().getId();
        this.nomeAluno = matricula.getAluno().getNome();
        this.idMateria = matricula.getMateria().getId();
        this.nomeMateria = matricula.getMateria().getNome();
        this.nomeCurso = matricula.getMateria().getCurso().getNome();
        this.data = matricula.getDataMatricula();
        
        this.ativa = matricula.isAtiva();

        this.mediaFinal = matricula.getNotaFinal();

        if (matricula.getStatus() != null) {
            this.situacao = matricula.getStatus().name();
        }

        if (matricula.getNotasLancadas() != null) {
            this.notas = matricula.getNotasLancadas().stream()
                    .map(DadosNota::new)
                    .collect(Collectors.toList());
        }
    }

    // --- GETTERS E SETTERS ---
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
    public Double getMediaFinal() { return mediaFinal; }
    public void setMediaFinal(Double mediaFinal) { this.mediaFinal = mediaFinal; }
    public String getSituacao() { return situacao; }
    public void setSituacao(String situacao) { this.situacao = situacao; }
    public LocalDateTime getData() {return data;}
    public void setData(LocalDateTime data) {this.data = data;}
    public List<DadosNota> getNotas() { return notas; }
    public void setNotas(List<DadosNota> notas) { this.notas = notas; }
    public boolean isAtiva() { return ativa; }
    public void setAtiva(boolean ativa) { this.ativa = ativa; }
}