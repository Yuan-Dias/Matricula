package br.com.matricula.dto;

import br.com.matricula.model.Nota;

public class DadosNota {
    private Long idConfiguracao;
    private String descricao;
    private Double valor;

    public DadosNota() {}

    public DadosNota(Nota nota) {
        this.idConfiguracao = nota.getConfiguracao().getId();
        this.descricao = nota.getConfiguracao().getDescricaoNota();
        this.valor = nota.getValor();
    }

    // Getters e Setters
    public Long getIdConfiguracao() { return idConfiguracao; }
    public void setIdConfiguracao(Long idConfiguracao) { this.idConfiguracao = idConfiguracao; }
    public String getDescricao() { return descricao; }
    public void setDescricao(String descricao) { this.descricao = descricao; }
    public Double getValor() { return valor; }
    public void setValor(Double valor) { this.valor = valor; }
}