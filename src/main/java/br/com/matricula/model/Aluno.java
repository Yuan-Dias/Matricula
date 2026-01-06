package br.com.matricula.model;

import br.com.matricula.dto.DadosAluno;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity(name = "Aluno")
@Table(name = "alunos")
public class Aluno extends Usuario {
    
    private String email;
    private String cpf;

    // --- CONSTRUTOR VAZIO ---
    public Aluno() {
    }

    // --- CONSTRUTOR VIA DTO ---
    public Aluno(DadosAluno dados) {
        // Define login e senha padrão ou baseados no DTO
        // Login e CPF como senha inicial
        super(dados.getEmail(), dados.getCpf(), dados.getNome(), TipoUsuario.ALUNO);
        this.email = dados.getEmail();
        this.cpf = dados.getCpf();
    }

    // --- GETTERS E SETTERS ---
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getCpf() { return cpf; }
    public void setCpf(String cpf) { this.cpf = cpf; }
}