package br.com.matricula.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.security.core.userdetails.UserDetails;

import br.com.matricula.model.TipoUsuario;
import br.com.matricula.model.Usuario;

public interface UsuarioRepository extends JpaRepository<Usuario, Long> {

    UserDetails findByLogin(String login);
    Optional<Usuario> findById(Long id);
    List<Usuario> findByTipo(TipoUsuario tipo);
}