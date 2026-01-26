package br.com.matricula.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import br.com.matricula.model.Nota;
import java.util.List;
import java.util.Optional;

public interface NotaRepository extends JpaRepository<Nota, Long> {
    List<Nota> findByMatriculaId(Long matriculaId);
    Optional<Nota> findByMatriculaIdAndConfiguracaoId(Long matriculaId, Long configuracaoId);
}