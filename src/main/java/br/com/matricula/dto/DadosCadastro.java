package br.com.matricula.dto;

import br.com.matricula.model.TipoUsuario;

public class DadosCadastro {
    private String login;
    private String nome;
    private String senha;
    private TipoUsuario tipo;

    public String getLogin() { return login; }
    public void setLogin(String login) { this.login = login; }
    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }
    public String getSenha() { return senha; }
    public void setSenha(String senha) { this.senha = senha; }
    public TipoUsuario getTipo() { return tipo; }
    public void setTipo(TipoUsuario tipo) { this.tipo = tipo; }
}