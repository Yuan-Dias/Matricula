package br.com.matricula.repository;

import br.com.matricula.model.TipoUsuario;
import br.com.matricula.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.List;

public interface UsuarioRepository extends JpaRepository<Usuario, Long> {

    UserDetails findByLogin(String login);

    List<Usuario> findByTipo(TipoUsuario tipo);
}