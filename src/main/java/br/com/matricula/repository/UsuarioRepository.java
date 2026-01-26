package br.com.matricula.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.security.core.userdetails.UserDetails;

import br.com.matricula.dto.DadosListagemUsuario;
import br.com.matricula.model.TipoUsuario;
import br.com.matricula.model.Usuario;

public interface UsuarioRepository extends JpaRepository<Usuario, Long> {

    UserDetails findByLogin(String login);
    
    @SuppressWarnings("null")
    @Override
    Optional<Usuario> findById(@SuppressWarnings("null") Long id);
    List<Usuario> findByTipo(TipoUsuario tipo);

    @Query("SELECT new br.com.matricula.dto.DadosListagemUsuario(u.id, u.nome, u.login, u.tipo) FROM Usuario u")
    List<DadosListagemUsuario> findAllAsDto();

    @Query("SELECT new br.com.matricula.dto.DadosListagemUsuario(u.id, u.nome, u.login, u.tipo) FROM Usuario u WHERE u.tipo = :tipo")
    List<DadosListagemUsuario> findByTipoAsDto(TipoUsuario tipo);
}