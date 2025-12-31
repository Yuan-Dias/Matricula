package br.com.matricula.dto;

import jakarta.validation.constraints.NotBlank;

public class DadosAluno {
    @NotBlank private String nome;
    @NotBlank private String email;
    @NotBlank private String cpf;

    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getCpf() { return cpf; }
    public void setCpf(String cpf) { this.cpf = cpf; }
}