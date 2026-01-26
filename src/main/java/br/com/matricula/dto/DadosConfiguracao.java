package br.com.matricula.dto;

import br.com.matricula.model.ConfiguracaoAvaliacao;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class DadosConfiguracao {
    
    private Long id;

    @NotBlank 
    private String descricaoNota;

    @NotNull 
    private Double peso;

    public DadosConfiguracao() {}

    public DadosConfiguracao(ConfiguracaoAvaliacao config) {
        this.id = config.getId();
        this.descricaoNota = config.getDescricaoNota();
        this.peso = config.getPeso();
    }

    // Getters e Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getDescricaoNota() { return descricaoNota; }
    public void setDescricaoNota(String descricaoNota) { this.descricaoNota = descricaoNota; }
    public Double getPeso() { return peso; }
    public void setPeso(Double peso) { this.peso = peso; }
}