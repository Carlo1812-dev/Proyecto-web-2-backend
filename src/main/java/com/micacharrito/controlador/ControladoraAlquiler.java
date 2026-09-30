package com.micacharrito.controlador;

import java.io.ByteArrayOutputStream;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.properties.UnitValue;
import com.micacharrito.modelo.Alquiler;
import com.micacharrito.modelo.Usuario;
import com.micacharrito.modelo.Vehiculo;
import com.micacharrito.repositorio.alquiler;
import com.micacharrito.repositorio.usuario;
import com.micacharrito.repositorio.vehiculo;

@RestController
@RequestMapping("/alquiler/a/")
public class ControladoraAlquiler {

	@Autowired
	private alquiler repoAlquiler;

	@Autowired
	private usuario repoUsuario;

	@Autowired
	private vehiculo repoVehiculo;

	// TAREA 3 - Crear y verificar la solicitud de alquiler y estado a pendiente de entrega
	/** Crea la solicitud de alquiler del vehiculo seleccionado */
	@PostMapping("/guardarAlquiler/")
	public ResponseEntity<?> guardarAlquiler(@RequestBody Alquiler peticion) {

		if (peticion.getUsuario() == null || peticion.getUsuario().getIdentificacion() == null) {
			return ResponseEntity.badRequest().body("Debe indicar el usuario que solicita el alquiler");
		}
		if (peticion.getVehiculo() == null || peticion.getVehiculo().getId() == null) {
			return ResponseEntity.badRequest().body("Debe seleccionar un vehiculo");
		}

		Usuario u = this.repoUsuario.findByIdentificacion(peticion.getUsuario().getIdentificacion()).orElse(null);
		if (u == null) {
			return ResponseEntity.badRequest().body("Usuario no encontrado");
		}

		Vehiculo v = this.repoVehiculo.findById(peticion.getVehiculo().getId()).orElse(null);
		if (v == null) {
			return ResponseEntity.badRequest().body("Vehiculo no encontrado");
		}

		if (v.getEstado() != Vehiculo.EstadoVehiculo.DISPONIBLE) {
			return ResponseEntity.badRequest().body("El vehiculo no esta disponible");
		}

		if (peticion.getFechaInicio() == null || peticion.getFechaEntrega() == null) {
			return ResponseEntity.badRequest().body("Debe indicar la fecha de inicio y la fecha de entrega");
		}

		LocalDate fechaInicio = peticion.getFechaInicio();
		LocalDate fechaEntrega = peticion.getFechaEntrega();

		if (fechaInicio.isBefore(LocalDate.now())) {
			return ResponseEntity.badRequest().body("La fecha de inicio no puede ser anterior a hoy");
		}
		if (fechaEntrega.isBefore(fechaInicio)) {
			return ResponseEntity.badRequest().body("La fecha de entrega no puede ser anterior a la fecha de inicio");
		}

		long dias = ChronoUnit.DAYS.between(fechaInicio, fechaEntrega);
		if (dias < 1) {
			dias = 1;
		}
		double valorTotal = v.getValorAlquiler() * dias;

		String numeroAlquiler = "ALQ-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

		Alquiler nuevo = new Alquiler(numeroAlquiler, u, v, fechaInicio, fechaEntrega, valorTotal);

		v.setEstado(Vehiculo.EstadoVehiculo.ALQUILADO);
		this.repoVehiculo.save(v);

		return ResponseEntity.ok(this.repoAlquiler.save(nuevo));
	}

	/** Alquileres del usuario actual */
	@GetMapping("/misAlquileres/")
	public ResponseEntity<?> misAlquileres(@RequestParam("identificacion") String identificacion) {

		Usuario u = this.repoUsuario.findByIdentificacion(identificacion).orElse(null);
		if (u == null) {
			return ResponseEntity.badRequest().body("Usuario no encontrado");
		}

		List<Alquiler> lista = this.repoAlquiler.findByUsuarioId(u.getId());
		return ResponseEntity.ok(lista);
	}

	/** El usuario puede cancelar su alquiler en cualquier momento */
	@PostMapping("/cancelar/")
	public ResponseEntity<String> cancelar(@RequestParam("numero") String numero,
			@RequestParam("identificacion") String identificacion) {

		Alquiler a = this.repoAlquiler.findByNumeroAlquiler(numero).orElse(null);
		if (a == null) {
			return ResponseEntity.badRequest().body("No existe el alquiler " + numero);
		}

		if (!a.getUsuario().getIdentificacion().equals(identificacion)) {
			return ResponseEntity.badRequest().body("Este alquiler no pertenece al usuario actual");
		}

		if (a.getEstado() == Alquiler.EstadoAlquiler.CANCELADO) {
			return ResponseEntity.badRequest().body("El alquiler " + numero + " ya estaba cancelado");
		}

		if (a.getEstado() == Alquiler.EstadoAlquiler.DEVUELTO) {
			return ResponseEntity.badRequest().body("El alquiler " + numero + " ya fue devuelto y no se puede cancelar");
		}

		a.setEstado(Alquiler.EstadoAlquiler.CANCELADO);
		this.repoAlquiler.save(a);

		Vehiculo v = a.getVehiculo();
		v.setEstado(Vehiculo.EstadoVehiculo.DISPONIBLE);
		this.repoVehiculo.save(v);

		return ResponseEntity.ok("Alquiler " + numero + " cancelado. El vehiculo " + v.getPlaca()
				+ " volvio a estar disponible.");
	}

	// TAREA 4 - Integrar proceso de alquiler y descarga automatica del PDF
	/** Descarga del PDF con la informacion del alquiler */
	@GetMapping("/pdf/")
	public ResponseEntity<byte[]> pdf(@RequestParam("numero") String numero) {

		Alquiler a = this.repoAlquiler.findByNumeroAlquiler(numero).orElse(null);
		if (a == null) {
			return ResponseEntity.notFound().build();
		}

		byte[] contenido = generarPdf(a);

		HttpHeaders cabeceras = new HttpHeaders();
		cabeceras.setContentType(MediaType.APPLICATION_PDF);
		cabeceras.setContentDispositionFormData("attachment", "alquiler-" + numero + ".pdf");

		return ResponseEntity.ok().headers(cabeceras).body(contenido);
	}

	private byte[] generarPdf(Alquiler a) {
		try {
			ByteArrayOutputStream salida = new ByteArrayOutputStream();
			Document documento = new Document(new PdfDocument(new PdfWriter(salida)));
			DateTimeFormatter formato = DateTimeFormatter.ofPattern("dd/MM/yyyy");

			documento.add(new Paragraph("Comprobante de Alquiler - Mi Cacharrito").setBold().setFontSize(18));
			documento.add(new Paragraph(""));

			Table tabla = new Table(UnitValue.createPercentArray(2)).useAllAvailableWidth();
			tabla.addCell("Numero de alquiler:");
			tabla.addCell(a.getNumeroAlquiler());
			tabla.addCell("Estado:");
			tabla.addCell(a.getDescripcionEstado());
			tabla.addCell("Cliente:");
			tabla.addCell(a.getUsuario().getNombreCompleto());
			tabla.addCell("Identificacion:");
			tabla.addCell(a.getUsuario().getIdentificacion());
			tabla.addCell("Fecha de inicio:");
			tabla.addCell(a.getFechaInicio().format(formato));
			tabla.addCell("Fecha de entrega:");
			tabla.addCell(a.getFechaEntrega().format(formato));
			tabla.addCell("Tipo de vehiculo:");
			tabla.addCell(a.getVehiculo().getTipo().name());
			tabla.addCell("Placa:");
			tabla.addCell(a.getVehiculo().getPlaca());
			tabla.addCell("Color:");
			tabla.addCell(a.getVehiculo().getColor());
			tabla.addCell("Marca y modelo:");
			tabla.addCell(a.getVehiculo().getMarca() + " " + a.getVehiculo().getModelo());
			tabla.addCell("Valor por dia:");
			tabla.addCell("$" + String.format("%,.0f", a.getVehiculo().getValorAlquiler()));
			tabla.addCell("Valor del alquiler:");
			tabla.addCell("$" + String.format("%,.0f", a.getValorTotal()));

			if (a.getDiasMora() != null && a.getDiasMora() > 0) {
				tabla.addCell("Dias de mora:");
				tabla.addCell(a.getDiasMora() + " dia(s)");
				tabla.addCell("Valor de mora:");
				tabla.addCell("$" + String.format("%,.0f", a.getValorMora()));
				tabla.addCell("Valor final:");
				tabla.addCell("$" + String.format("%,.0f", a.getValorTotal()));
			}

			documento.add(tabla);
			documento.close();
			return salida.toByteArray();
		} catch (Exception e) {
			throw new RuntimeException("Error al generar el PDF", e);
		}
	}
}
