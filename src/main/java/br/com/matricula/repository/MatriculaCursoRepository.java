package br.com.matricula.repository;

import br.com.matricula.model.MatriculaCurso;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface MatriculaCursoRepository extends JpaRepository<MatriculaCurso, Long> {
    Optional<MatriculaCurso> findByAlunoIdAndCursoId(Long alunoId, Long cursoId);
    boolean existsByAlunoIdAndCursoId(Long alunoId, Long cursoId);
    List<MatriculaCurso> findByAlunoLogin(String login);
    List<MatriculaCurso> findByAlunoId(Long alunoId);

}