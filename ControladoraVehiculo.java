package com.micacharrito.controlador;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.micacharrito.modelo.Vehiculo;
import com.micacharrito.repositorio.vehiculo;

@RestController
@RequestMapping("/vehiculo/v/")
public class ControladoraVehiculo {

	@Autowired
	private vehiculo repoVehiculo;

	/** Listado general de vehiculos disponibles para alquilar */
	@GetMapping("/listarDisponibles/")
	public List<Vehiculo> listarDisponibles() {
		return this.repoVehiculo.findByEstado(Vehiculo.EstadoVehiculo.DISPONIBLE);
	}

	/** Vehiculos disponibles filtrados por tipo (automovil, camioneta, ...) */
	@GetMapping("/listarDisponiblesTipo/")
	public List<Vehiculo> listarDisponiblesTipo(@RequestParam("tipo") Vehiculo.TipoVehiculo tipo) {
		return this.repoVehiculo.findByEstadoAndTipo(Vehiculo.EstadoVehiculo.DISPONIBLE, tipo);
	}

	/** Todos los vehiculos, sin importar su estado (lo usa el administrador) */
	@GetMapping("/listarTodo/")
	public List<Vehiculo> listarTodo() {
		return this.repoVehiculo.findAll();
	}

	/** Todos los vehiculos de un tipo, sin importar su estado (administrador) */
	@GetMapping("/listarTodoTipo/")
	public List<Vehiculo> listarTodoTipo(@RequestParam("tipo") Vehiculo.TipoVehiculo tipo) {
		return this.repoVehiculo.findByTipo(tipo);
	}
}
