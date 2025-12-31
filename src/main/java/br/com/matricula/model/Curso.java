package br.com.matricula.model;

import br.com.matricula.dto.DadosCurso;
import jakarta.persistence.*;

@Table(name = "cursos")
@Entity(name = "Curso")
public class Curso {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String nome;
    private String descricao;
    private Integer cargaHoraria;
    private Integer capacidade;

    @ManyToOne
    @JoinColumn(name = "professor_id")
    private Usuario professor;

    public Curso() {
    }

    public Curso(String nome, String descricao, Integer cargaHoraria, Usuario professor) {
        this.nome = nome;
        this.descricao = descricao;
        this.cargaHoraria = cargaHoraria;
        this.professor = professor;
    }

    // Construtor auxiliar caso use o DTO direto
    public Curso(DadosCurso dados, Usuario professor) {
        this.nome = dados.getNome();
        this.descricao = dados.getDescricao();
        this.cargaHoraria = dados.getCargaHoraria();
        this.capacidade = dados.getCapacidade();
        this.professor = professor;
    }

    // --- GETTERS E SETTERS ---
    public Long getId() {return id;}
    public void setId(Long id) {this.id = id;}
    public String getNome() {return nome;}
    public void setNome(String nome) {this.nome = nome;}
    public String getDescricao() {return descricao;}
    public void setDescricao(String descricao) {this.descricao = descricao;}
    public Integer getCargaHoraria() {return cargaHoraria;}
    public void setCargaHoraria(Integer cargaHoraria) {this.cargaHoraria = cargaHoraria;}
    public Integer getCapacidade() {return capacidade;}
    public void setCapacidade(Integer capacidade) {this.capacidade = capacidade;}
    public Usuario getProfessor() {return professor;}
    public void setProfessor(Usuario professor) {this.professor = professor;}
}