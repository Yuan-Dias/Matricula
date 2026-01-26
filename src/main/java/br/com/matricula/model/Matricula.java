package br.com.matricula.model;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.persistence.Transient;

@Table(name = "matriculas")
@Entity(name = "Matricula")
public class Matricula {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "aluno_id")
    private Aluno aluno;

    @ManyToOne
    @JoinColumn(name = "materia_id")
    private Materia materia;

    private LocalDateTime dataMatricula = LocalDateTime.now();

    @ManyToOne
    @JoinColumn(name = "matricula_curso_id")
    private MatriculaCurso matriculaCurso;

    @OneToMany(mappedBy = "matricula", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<Nota> notasLancadas = new ArrayList<>();

    @Enumerated(EnumType.STRING)
    private StatusMatricula status = StatusMatricula.CURSANDO;

    private Double notaFinal;

    public Matricula() {
    }

    public Matricula(Aluno aluno, Materia materia, MatriculaCurso matriculaCurso) {
        this.aluno = aluno;
        this.materia = materia;
        this.matriculaCurso = matriculaCurso;
    }

    @Transient
    public Double getMediaFinal() {
        if (notasLancadas == null || notasLancadas.isEmpty()) return 0.0;

        double somaPonderada = 0.0;
        double somaPesos = 0.0;
        Nota notaRecuperacao = null;

        for (Nota n : notasLancadas) {
            if (n.getConfiguracao().getDescricaoNota().equalsIgnoreCase("RECUPERACAO") || 
                n.getConfiguracao().getDescricaoNota().equalsIgnoreCase("PROVA FINAL")) {
                notaRecuperacao = n;
            } else {
                double peso = n.getConfiguracao().getPeso();
                somaPonderada += n.getValor() * peso;
                somaPesos += peso;
            }
        }

        if (somaPesos == 0) return 0.0;
        double mediaParcial = somaPonderada / somaPesos;

        // LÓGICA DA RECUPERAÇÃO:
        if (notaRecuperacao != null && mediaParcial < 7.0) {
            double mediaComRec = (mediaParcial + notaRecuperacao.getValor()) / 2;
            return Math.round(mediaComRec * 100.0) / 100.0;
        }

        return Math.round(mediaParcial * 100.0) / 100.0;
    }

    @Transient
    public String getSituacao() {
        if (notasLancadas == null || notasLancadas.isEmpty()) return "CURSANDO";

        double somaPesosAtuais = notasLancadas.stream()
                                    .mapToDouble(n -> n.getConfiguracao().getPeso())
                                    .sum();
        double media = getMediaFinal();

        if (somaPesosAtuais >= 10.0) {
            if (media >= 7.0) return "APROVADO";
            if (media >= 5.0) return "RECUPERACAO";
            return "REPROVADO";
        }

        if (media < 5.0 && somaPesosAtuais > 5.0) {
            return "RECUPERACAO";
        }

        return "CURSANDO";
    }

    public void setSituacao(StatusMatricula status) {
        this.status = status;
    }

    // --- GETTERS E SETTERS ---

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Aluno getAluno() {
        return aluno;
    }

    public void setAluno(Aluno aluno) {
        this.aluno = aluno;
    }

    public Materia getMateria() {
        return materia;
    }

    public void setMateria(Materia materia) {
        this.materia = materia;
    }

    public LocalDateTime getDataMatricula() {
        return dataMatricula;
    }

    public void setDataMatricula(LocalDateTime dataMatricula) {
        this.dataMatricula = dataMatricula;
    }

    public MatriculaCurso getMatriculaCurso() {
        return matriculaCurso;
    }

    public void setMatriculaCurso(MatriculaCurso matriculaCurso) {
        this.matriculaCurso = matriculaCurso;
    }

    public List<Nota> getNotasLancadas() {
        return notasLancadas;
    }

    public void setNotasLancadas(List<Nota> notasLancadas) {
        this.notasLancadas = notasLancadas;
    }

    public String getStatus() {
        return status.toString();
    }

    public void setStatus(StatusMatricula status) {
        this.status = status;
    }

    public Double getNotaFinal() {
        return notaFinal;
    }

    public void setNotaFinal(Double notaFinal) {
        this.notaFinal = notaFinal;
    }   
}