package br.com.matricula.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import br.com.matricula.model.ConfiguracaoAvaliacao;

public interface ConfiguracaoAvaliacaoRepository extends JpaRepository<ConfiguracaoAvaliacao, Long> {
    List<ConfiguracaoAvaliacao> findByMateriaId(Long materiaId);
    List<ConfiguracaoAvaliacao> findByMateriaIdAndAtivoTrue(Long materiaId);
}