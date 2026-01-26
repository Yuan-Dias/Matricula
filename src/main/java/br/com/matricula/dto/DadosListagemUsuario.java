package br.com.matricula.dto;

import br.com.matricula.model.TipoUsuario;
import br.com.matricula.model.Usuario;

public class DadosListagemUsuario {

    private final Long id;
    private final String nome;
    private final String login;
    private final TipoUsuario tipo;

    // Construtor que recebe a Entidade
    public DadosListagemUsuario(Usuario usuario) {
        this.id = usuario.getId();
        this.nome = usuario.getNome();
        this.login = usuario.getLogin();
        this.tipo = usuario.getTipo();
    }

    public DadosListagemUsuario(Long id, String nome, String login, TipoUsuario tipo) {
        this.id = id;
        this.nome = nome;
        this.login = login;
        this.tipo = tipo;
    }

    // --- GETTERS (Obrigatórios para o JSON ser gerado) ---
    public Long getId() { return id; }
    public String getNome() { return nome; }
    public String getLogin() { return login; }
    public TipoUsuario getTipo() { return tipo; }
}