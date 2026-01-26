package br.com.matricula.model;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "notas")
public class Nota {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Double valor;

    @ManyToOne
    @JoinColumn(name = "configuracao_avaliacao_id", nullable = false)
    private ConfiguracaoAvaliacao configuracao; 

    @JsonIgnore
    @ManyToOne
    @JoinColumn(name = "matricula_id", nullable = false)
    private Matricula matricula;

    // --- CONSTRUTORES ---

    public Nota() {
    }

    public Nota(Matricula matricula, ConfiguracaoAvaliacao configuracao, Double valor) {
        this.matricula = matricula;
        this.configuracao = configuracao;
        this.valor = valor;
    }

    // --- GETTERS E SETTERS ---

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Double getValor() {
        return valor;
    }

    public void setValor(Double valor) {
        this.valor = valor;
    }

    public ConfiguracaoAvaliacao getConfiguracao() {
        return configuracao;
    }

    public void setConfiguracao(ConfiguracaoAvaliacao configuracao) {
        this.configuracao = configuracao;
    }

    public Matricula getMatricula() {
        return matricula;
    }

    public void setMatricula(Matricula matricula) {
        this.matricula = matricula;
    }
}