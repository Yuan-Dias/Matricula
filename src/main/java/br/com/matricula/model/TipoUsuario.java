package br.com.matricula.model;

import java.text.Normalizer;

import com.fasterxml.jackson.annotation.JsonCreator;

public enum TipoUsuario {
    INSTITUICAO,
    PROFESSOR,
    ALUNO;

    @JsonCreator
    public static TipoUsuario fromString(String value) {
        if (value == null) return null;

        // Remove espaços em branco nas pontas
        // Transforma tudo em MAIÚSCULO
        // Remove acentos (Normalizer)
        String formatado = Normalizer.normalize(value.trim().toUpperCase(), Normalizer.Form.NFD)
                .replaceAll("[^\\p{ASCII}]", "");

        for (TipoUsuario tipo : TipoUsuario.values()) {
            if (tipo.name().equals(formatado)) {
                return tipo;
            }
        }
        
        throw new IllegalArgumentException("Tipo de usuário inválido: " + value);
    }
}