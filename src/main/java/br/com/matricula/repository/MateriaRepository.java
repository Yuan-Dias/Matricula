package br.com.matricula.repository;

import br.com.matricula.model.Materia;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface MateriaRepository extends JpaRepository<Materia, Long> {
    List<Materia> findByCursoId(Long idCurso);
}