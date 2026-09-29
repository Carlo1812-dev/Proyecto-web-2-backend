package com.micacharrito.repositorio;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.micacharrito.modelo.Alquiler;

@Repository
public interface alquiler extends JpaRepository<Alquiler, Long> {

	public List<Alquiler> findByUsuarioId(Long usuarioId);

	public List<Alquiler> findByEstado(Alquiler.EstadoAlquiler estado);

	public Optional<Alquiler> findByNumeroAlquiler(String numeroAlquiler);

	public Optional<Alquiler> findByVehiculoPlacaAndEstado(String placa, Alquiler.EstadoAlquiler estado);

	public boolean existsByNumeroAlquiler(String numeroAlquiler);

	/** Alquileres activos cuya fecha de entrega ya vencio (PENDIENTE_ENTREGA o ENTREGADO) */
	@Query(value = "SELECT * FROM alquileres WHERE estado IN ('PENDIENTE_ENTREGA', 'ENTREGADO') "
			+ "AND fecha_entrega < CURDATE()", nativeQuery = true)
	public List<Alquiler> alquileresAtrasados();
}
