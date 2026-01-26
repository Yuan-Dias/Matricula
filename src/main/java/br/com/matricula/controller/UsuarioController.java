package br.com.matricula.controller;

import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import br.com.matricula.dto.DadosCadastro;
import br.com.matricula.dto.DadosListagemUsuario;
import br.com.matricula.model.*;
import br.com.matricula.service.*;

@RestController
@RequestMapping("/usuarios")
public class UsuarioController {

    private final UsuarioService service;

    public UsuarioController(UsuarioService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<Object> cadastrar(@RequestBody DadosCadastro dados) {
        try {
            service.cadastrar(dados);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<List<DadosListagemUsuario>> listarTodos() {
        return ResponseEntity.ok(service.listarTodos());
    }

    @GetMapping("/tipo/{tipo}")
    public ResponseEntity<List<DadosListagemUsuario>> listarPorTipo(@PathVariable TipoUsuario tipo) {
        return ResponseEntity.ok(service.listarPorTipo(tipo));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Object> atualizar(@PathVariable Long id, @RequestBody DadosCadastro dados) {
        try {
            return ResponseEntity.ok(service.atualizar(id, dados));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

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