package br.com.matricula.dto;

import br.com.matricula.model.TipoUsuario;

public class DadosTokenJWT {
    private Long id;
    private String token;
    private String login;
    private String nome;
    private TipoUsuario tipo;

    // Construtor completo
    public DadosTokenJWT(Long id, String token, String login, String nome, TipoUsuario tipo) {
        this.id = id;
        this.token = token;
        this.login = login;
        this.nome = nome;
        this.tipo = tipo;
    }

    // Getters e Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }

    public String getLogin() { return login; }
    public void setLogin(String login) { this.login = login; }

    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }

    public TipoUsuario getTipo() { return tipo; }
    public void setTipo(TipoUsuario tipo) { this.tipo = tipo; }
}