package br.com.matricula.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import br.com.matricula.model.Matricula;

public interface MatriculaRepository extends JpaRepository<Matricula, Long> {
    List<Matricula> findByAlunoLogin(String login);
    List<Matricula> findByMateriaProfessorLogin(String login);
    List<Matricula> findByMateriaCursoId(Long idCurso);
    List<Matricula> findByMateriaId(Long idMateria);
}