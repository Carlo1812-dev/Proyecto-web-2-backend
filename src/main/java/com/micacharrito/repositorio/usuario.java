package com.micacharrito.repositorio;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.micacharrito.modelo.Usuario;

@Repository
public interface usuario extends JpaRepository<Usuario, Long> {

	public Optional<Usuario> findByIdentificacion(String identificacion);

	public boolean existsByIdentificacion(String identificacion);
}
