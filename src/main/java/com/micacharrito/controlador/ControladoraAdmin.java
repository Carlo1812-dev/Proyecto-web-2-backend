package com.micacharrito.controlador;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.micacharrito.modelo.Alquiler;
import com.micacharrito.modelo.Vehiculo;
import com.micacharrito.repositorio.alquiler;
import com.micacharrito.repositorio.vehiculo;

@RestController
@RequestMapping("/admin/ad/")
public class ControladoraAdmin {

	@Autowired
	private alquiler repoAlquiler;

	@Autowired
	private vehiculo repoVehiculo;

	/** Vehiculos alquilados que aun NO han sido entregados al usuario */
	@GetMapping("/pendientes/")
	public List<Alquiler> pendientes() {
		return this.repoAlquiler.findByEstado(Alquiler.EstadoAlquiler.PENDIENTE_ENTREGA);
	}

	/** Alquileres ya entregados al usuario y todavia en su poder */
	@GetMapping("/entregados/")
	public List<Alquiler> entregados() {
		return this.repoAlquiler.findByEstado(Alquiler.EstadoAlquiler.ENTREGADO);
	}

	/** Alquileres cuya fecha de entrega ya vencio */
	@GetMapping("/atrasados/")
	public List<Alquiler> atrasados() {
		return this.repoAlquiler.alquileresAtrasados();
	}

	/** Busqueda de un alquiler por su numero */
	@GetMapping("/buscarPorNumero/")
	public ResponseEntity<?> buscarPorNumero(@RequestParam("numero") String numero) {
		Alquiler a = this.repoAlquiler.findByNumeroAlquiler(numero).orElse(null);
		if (a == null) {
			return ResponseEntity.badRequest().body("No existe el alquiler " + numero);
		}
		return ResponseEntity.ok(a);
	}

	/**
	 * El usuario reclama el vehiculo: el administrador busca por la PLACA
	 * y cambia el estado del alquiler a "entregado".
	 */
	@PostMapping("/entregar/")
	public ResponseEntity<String> entregar(@RequestParam("placa") String placa) {

		String placaLimpia = placa == null ? "" : placa.trim().toUpperCase();

		if (placaLimpia.isEmpty()) {
			return ResponseEntity.badRequest().body("Debe digitar el numero de placa");
		}

		Alquiler a = this.repoAlquiler
				.findByVehiculoPlacaAndEstado(placaLimpia, Alquiler.EstadoAlquiler.PENDIENTE_ENTREGA).orElse(null);

		if (a == null) {
			boolean existeVehiculo = this.repoVehiculo.existsByPlaca(placaLimpia);
			if (!existeVehiculo) {
				return ResponseEntity.badRequest().body("No existe ningun vehiculo con la placa " + placaLimpia);
			}
			return ResponseEntity.badRequest()
					.body("El vehiculo " + placaLimpia + " no tiene un alquiler pendiente de entrega");
		}

		a.setEstado(Alquiler.EstadoAlquiler.ENTREGADO);
		this.repoAlquiler.save(a);

		return ResponseEntity.ok("Alquiler " + a.getNumeroAlquiler() + " entregado al usuario "
				+ a.getUsuario().getNombreCompleto() + " (vehiculo " + placaLimpia + ")");
	}

	/**
	 * El usuario devuelve el vehiculo: el administrador busca por el NUMERO DE ALQUILER
	 * y el vehiculo pasa a estar "disponible" nuevamente. Si la devolucion se hace
	 * despues de la fecha registrada se cobran los dias posteriores.
	 */
	@PostMapping("/devolver/")
	public ResponseEntity<String> devolver(@RequestParam("numero") String numero) {

		Alquiler a = this.repoAlquiler.findByNumeroAlquiler(numero).orElse(null);
		if (a == null) {
			return ResponseEntity.badRequest().body("No existe el alquiler " + numero);
		}

		if (a.getEstado() == Alquiler.EstadoAlquiler.DEVUELTO) {
			return ResponseEntity.badRequest().body("El alquiler " + numero + " ya fue devuelto");
		}

		if (a.getEstado() == Alquiler.EstadoAlquiler.CANCELADO) {
			return ResponseEntity.badRequest().body("El alquiler " + numero + " esta cancelado");
		}

		LocalDate hoy = LocalDate.now();
		double valorTotal = a.getValorTotal();
		String mensaje = "Alquiler " + numero + ": vehiculo " + a.getVehiculo().getPlaca()
				+ " devuelto y puesto a DISPONIBLE.";

		// Cobro de los dias posteriores a la fecha registrada
		if (hoy.isAfter(a.getFechaEntrega())) {
			long diasMora = ChronoUnit.DAYS.between(a.getFechaEntrega(), hoy);
			double valorMora = a.getVehiculo().getValorAlquiler() * diasMora;

			a.setDiasMora((int) diasMora);
			a.setValorMora(valorMora);
			valorTotal += valorMora;

			mensaje += " Devolucion atrasada " + diasMora + " dia(s): cobro adicional de $"
					+ String.format("%,.0f", valorMora) + ". Valor total: $" + String.format("%,.0f", valorTotal);
		} else {
			mensaje += " Devolucion a tiempo. Valor total: $" + String.format("%,.0f", valorTotal);
		}

		a.setEstado(Alquiler.EstadoAlquiler.DEVUELTO);
		a.setValorTotal(valorTotal);
		this.repoAlquiler.save(a);

		Vehiculo v = a.getVehiculo();
		v.setEstado(Vehiculo.EstadoVehiculo.DISPONIBLE);
		this.repoVehiculo.save(v);

		return ResponseEntity.ok(mensaje);
	}
}
