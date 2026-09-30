package com.micacharrito.repositorio;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.micacharrito.modelo.Vehiculo;

@Repository
public interface vehiculo extends JpaRepository<Vehiculo, Long> {

	public List<Vehiculo> findByEstado(Vehiculo.EstadoVehiculo estado);

	public List<Vehiculo> findByEstadoAndTipo(Vehiculo.EstadoVehiculo estado, Vehiculo.TipoVehiculo tipo);

	public List<Vehiculo> findByTipo(Vehiculo.TipoVehiculo tipo);

	public boolean existsByPlaca(String placa);
}
