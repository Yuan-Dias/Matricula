package br.com.matricula.model;

import java.util.ArrayList; 
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;

import br.com.matricula.dto.DadosConfiguracao; // <--- Importante
import jakarta.persistence.CascadeType;      // <--- Importante
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;

@Entity
@Table(name = "configuracao_avaliacao")
public class ConfiguracaoAvaliacao {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String descricaoNota;

    @Column(nullable = false)
    private Double peso;

    @JsonIgnore
    @ManyToOne
    @JoinColumn(name = "materia_id", nullable = false)
    private Materia materia;

    @OneToMany(mappedBy = "configuracao", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Nota> notas = new ArrayList<>();

    @Column(nullable = false)
    private Boolean ativo = true;

    // --- CONSTRUTORES ---

    public ConfiguracaoAvaliacao() {
    }

    public ConfiguracaoAvaliacao(String descricaoNota, Double peso, Materia materia) {
        this.descricaoNota = descricaoNota;
        this.peso = peso;
        this.materia = materia;
    }

    public ConfiguracaoAvaliacao(DadosConfiguracao dados, Materia materia) {
        this.descricaoNota = dados.getDescricaoNota(); 
        this.peso = dados.getPeso();
        this.materia = materia;
    }

    // --- GETTERS E SETTERS ---

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getDescricaoNota() {
        return descricaoNota;
    }

    public void setDescricaoNota(String descricaoNota) {
        this.descricaoNota = descricaoNota;
    }

    public Double getPeso() {
        return peso;
    }

    public void setPeso(Double peso) {
        this.peso = peso;
    }

    public Materia getMateria() {
        return materia;
    }

    public void setMateria(Materia materia) {
        this.materia = materia;
    }
    
    public List<Nota> getNotas() {
        return notas;
    }

    public void setNotas(List<Nota> notas) {
        this.notas = notas;
    }
    public Boolean getAtivo() { 
        return ativo; 
    }
    
    public void setAtivo(Boolean ativo) { 
        this.ativo = ativo; 
    }
}