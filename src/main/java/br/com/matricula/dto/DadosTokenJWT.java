package br.com.matricula.dto;

import br.com.matricula.model.TipoUsuario;

public class DadosTokenJWT {
    private String token;
    private String login;
    private TipoUsuario tipo;

    // Construtor completo
    public DadosTokenJWT(String token, String login, TipoUsuario tipo) {
        this.token = token;
        this.login = login;
        this.tipo = tipo;
    }

    // Getters e Setters (Encapsulamento)
    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }

    public String getLogin() { return login; }
    public void setLogin(String login) { this.login = login; }

    public TipoUsuario getTipo() { return tipo; }
    public void setTipo(TipoUsuario tipo) { this.tipo = tipo; }
}