package br.com.matricula.dto;

public class DadosTokenJWT {
    private String token;

    public DadosTokenJWT(String token) {
        this.token = token;
    }

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }
}