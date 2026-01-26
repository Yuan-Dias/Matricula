package br.com.matricula.model;

import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;

@Entity(name = "Materia")
@Table(name = "materias")
public class Materia {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nome;
    private String descricao;

    @ManyToOne
    @JoinColumn(name = "curso_id")
    private Curso curso;

    @ManyToOne
    @JoinColumn(name = "professor_id")
    private Usuario professor;

    @OneToMany(mappedBy = "materia", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ConfiguracaoAvaliacao> configuracoes = new ArrayList<>();

    private boolean encerrada = false;

    public Materia() {}

    public Materia(String nome, String descricao, Curso curso, Usuario professor) {
        this.nome = nome;
        this.descricao = descricao;
        this.curso = curso;
        this.professor = professor;
    }

    // --- GETTERS E SETTERS ---
    public Long getId() {return id;}
    public void setId(Long id) {this.id = id;}
    public String getNome() {return nome;}
    public void setNome(String nome) {this.nome = nome;}
    public String getDescricao() {return descricao;}
    public void setDescricao(String descricao) {this.descricao = descricao;}
    public Curso getCurso() {return curso;}
    public void setCurso(Curso curso) {this.curso = curso;}
    public Usuario getProfessor() {return professor;}
    public void setProfessor(Usuario professor) {this.professor = professor;}
    public List<ConfiguracaoAvaliacao> getConfiguracoes() { return configuracoes; }
    public void setConfiguracoes(List<ConfiguracaoAvaliacao> configuracoes) { this.configuracoes = configuracoes; }
    public boolean isEncerrada() { return encerrada; }
    public void setEncerrada(boolean encerrada) { this.encerrada = encerrada; }
}