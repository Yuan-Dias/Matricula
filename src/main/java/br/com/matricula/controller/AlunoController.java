package br.com.matricula.controller;

import br.com.matricula.dto.DadosAluno;
import br.com.matricula.model.Aluno;
import br.com.matricula.repository.AlunoRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/alunos")
public class AlunoController {

    @Autowired
    private AlunoRepository repository;

    @PostMapping
    public void cadastrar(@RequestBody @Valid DadosAluno dados) {
        repository.save(new Aluno(dados));
    }

    @GetMapping
    public List<Aluno> listar() {
        return repository.findAll();
    }
}