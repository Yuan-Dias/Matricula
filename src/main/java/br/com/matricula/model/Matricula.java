package br.com.matricula.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

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

    private Double nota;

    private LocalDateTime dataMatricula = LocalDateTime.now();

    public Matricula() {
    }

    public Matricula(Aluno aluno, Materia materia) {
        this.aluno = aluno;
        this.materia = materia;
    }

    // --- GETTERS E SETTERS ---
    public Long getId() {return id;}
    public void setId(Long id) {this.id = id;}
    public Aluno getAluno() {return aluno;}
    public void setAluno(Aluno aluno) {this.aluno = aluno;}
    public Materia getMateria() {return materia;}
    public void setMateria(Materia materia) {this.materia = materia;}
    public Double getNota() {return nota;}
    public void setNota(Double nota) {this.nota = nota;}
    public LocalDateTime getDataMatricula() {return dataMatricula;}
    public void setDataMatricula(LocalDateTime dataMatricula) {this.dataMatricula = dataMatricula;}
}