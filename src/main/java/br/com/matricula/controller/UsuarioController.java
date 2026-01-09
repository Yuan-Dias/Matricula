package br.com.matricula.controller;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import br.com.matricula.dto.DadosCadastro;
import br.com.matricula.model.*;
import br.com.matricula.service.*;

@RestController
@RequestMapping("/usuarios")
public class UsuarioController {

    @Autowired
    private UsuarioService service;

    /**
     * CADASTRO GERAL
     * Recebe os dados de qualquer tipo de usuário.
     */
    @PostMapping
    public ResponseEntity<Object> cadastrar(@RequestBody DadosCadastro dados) {
        try {
            service.cadastrar(dados);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * LISTAGEM GENÉRICA
     * Retorna a lista completa de usuários do sistema.
     */
    @GetMapping
    public ResponseEntity<List<Usuario>> listarTodos() {
        return ResponseEntity.ok(service.listarTodos());
    }

    /**
     * LISTAGEM ESPECÍFICA
     * Filtra os usuários por tipo (Ex: /usuarios/tipo/PROFESSOR).
     */
    @GetMapping("/tipo/{tipo}")
    public ResponseEntity<List<Usuario>> listarPorTipo(@PathVariable TipoUsuario tipo) {
        return ResponseEntity.ok(service.listarPorTipo(tipo));
    }

    /**
     * ATUALIZAÇÃO
     * Atualiza dados básicos, login ou senha.
     */
    @PutMapping("/{id}")
    public ResponseEntity<Object> atualizar(@PathVariable Long id, @RequestBody DadosCadastro dados) {
        try {
            return ResponseEntity.ok(service.atualizar(id, dados));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * EXCLUSÃO
     * Remove o acesso do usuário ao sistema.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluir(@PathVariable Long id) {
        try {
            service.excluir(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}