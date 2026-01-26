package br.com.matricula.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import br.com.matricula.model.Materia;

public interface MateriaRepository extends JpaRepository<Materia, Long> {
    List<Materia> findByCursoId(Long idCurso);
    List<Materia> findByCursoIdAndProfessorLogin(Long idCurso, String login);
    List<Materia> findByProfessorId(Long idProfessor);
}