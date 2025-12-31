package br.com.matricula.repository;

import br.com.matricula.model.Matricula;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface MatriculaRepository extends JpaRepository<Matricula, Long> {
    List<Matricula> findByAlunoLogin(String login);
    List<Matricula> findByMateriaProfessorLogin(String login);
}