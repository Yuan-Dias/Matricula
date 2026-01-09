package br.com.matricula.model;

import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Table(name = "matriculas_cursos")
@Entity(name = "MatriculaCurso")
public class MatriculaCurso {

    @Id 
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "aluno_id")
    private Aluno aluno;

    @ManyToOne
    @JoinColumn(name = "curso_id")
    private Curso curso;

    private LocalDateTime dataIngresso = LocalDateTime.now();

    @OneToMany(mappedBy = "matriculaCurso", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Matricula> matriculasNasMaterias = new ArrayList<>();

    public MatriculaCurso() {}

    public MatriculaCurso(Aluno aluno, Curso curso) {
        this.aluno = aluno;
        this.curso = curso;
    }

    // --- GETTERS E SETTERS ---
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Aluno getAluno() { return aluno; }
    public void setAluno(Aluno aluno) { this.aluno = aluno; }
    public Curso getCurso() { return curso; }
    public void setCurso(Curso curso) { this.curso = curso; }
    public LocalDateTime getDataIngresso() { return dataIngresso; }
    public void setDataIngresso(LocalDateTime dataIngresso) { this.dataIngresso = dataIngresso; }
}