package br.com.matricula.dto;
import br.com.matricula.model.TipoUsuario;

public class DadosCadastro {
    private String login;
    private String senha;
    private TipoUsuario tipo;

    public String getLogin() { return login; }
    public void setLogin(String login) { this.login = login; }
    public String getSenha() { return senha; }
    public void setSenha(String senha) { this.senha = senha; }
    public TipoUsuario getTipo() { return tipo; }
    public void setTipo(TipoUsuario tipo) { this.tipo = tipo; }
}