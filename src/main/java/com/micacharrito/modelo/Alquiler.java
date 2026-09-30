package com.micacharrito.modelo;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.Transient;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;

@Entity
@Table(name = "alquileres")
public class Alquiler {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(nullable = false, unique = true)
	private String numeroAlquiler;

	@ManyToOne(fetch = FetchType.EAGER)
	@JoinColumn(name = "usuario_id", nullable = false)
	private Usuario usuario;

	@ManyToOne(fetch = FetchType.EAGER)
	@JoinColumn(name = "vehiculo_id", nullable = false)
	private Vehiculo vehiculo;

	@Column(nullable = false)
	private LocalDate fechaInicio;

	@Column(nullable = false)
	private LocalDate fechaEntrega;

	@Column(nullable = false)
	private Double valorTotal;

	// TAREA 3 - Crear y verificar la solicitud de alquiler y estado a pendiente de entrega
	@Column(nullable = false)
	@Enumerated(EnumType.STRING)
	private EstadoAlquiler estado = EstadoAlquiler.PENDIENTE_ENTREGA;

	/** Dias de mora cobrados al momento de la devolucion */
	@Column(nullable = false)
	private Integer diasMora = 0;

	/** Valor cobrado por los dias de mora */
	@Column(nullable = false)
	private Double valorMora = 0.0;

	/**
	 * PENDIENTE_ENTREGA: creado por el usuario, aun no recogido.
	 * ENTREGADO: el administrador lo entrego al usuario.
	 * DEVUELTO: el usuario lo devolvio, el vehiculo volvio a DISPONIBLE.
	 * CANCELADO: el usuario cancelo el alquiler.
	 */
	public enum EstadoAlquiler {
		PENDIENTE_ENTREGA, ENTREGADO, DEVUELTO, CANCELADO
	}

	public Alquiler() {
	}

	public Alquiler(String numeroAlquiler, Usuario usuario, Vehiculo vehiculo, LocalDate fechaInicio,
			LocalDate fechaEntrega, Double valorTotal) {
		this.numeroAlquiler = numeroAlquiler;
		this.usuario = usuario;
		this.vehiculo = vehiculo;
		this.fechaInicio = fechaInicio;
		this.fechaEntrega = fechaEntrega;
		this.valorTotal = valorTotal;
	}

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public String getNumeroAlquiler() {
		return numeroAlquiler;
	}

	public void setNumeroAlquiler(String numeroAlquiler) {
		this.numeroAlquiler = numeroAlquiler;
	}

	public Usuario getUsuario() {
		return usuario;
	}

	public void setUsuario(Usuario usuario) {
		this.usuario = usuario;
	}

	public Vehiculo getVehiculo() {
		return vehiculo;
	}

	public void setVehiculo(Vehiculo vehiculo) {
		this.vehiculo = vehiculo;
	}

	public LocalDate getFechaInicio() {
		return fechaInicio;
	}

	public void setFechaInicio(LocalDate fechaInicio) {
		this.fechaInicio = fechaInicio;
	}

	public LocalDate getFechaEntrega() {
		return fechaEntrega;
	}

	public void setFechaEntrega(LocalDate fechaEntrega) {
		this.fechaEntrega = fechaEntrega;
	}

	public Double getValorTotal() {
		return valorTotal;
	}

	public void setValorTotal(Double valorTotal) {
		this.valorTotal = valorTotal;
	}

	public EstadoAlquiler getEstado() {
		return estado;
	}

	public void setEstado(EstadoAlquiler estado) {
		this.estado = estado;
	}

	public Integer getDiasMora() {
		return diasMora;
	}

	public void setDiasMora(Integer diasMora) {
		this.diasMora = diasMora;
	}

	public Double getValorMora() {
		return valorMora;
	}

	public void setValorMora(Double valorMora) {
		this.valorMora = valorMora;
	}

	/** Estado en texto legible para el PDF y la interfaz */
	@Transient
	public String getDescripcionEstado() {
		switch (this.estado) {
		case PENDIENTE_ENTREGA:
			return "Pendiente de entrega";
		case ENTREGADO:
			return "Entregado";
		case DEVUELTO:
			return "Devuelto";
		case CANCELADO:
			return "Cancelado";
		default:
			return this.estado.name();
		}
	}

	// TAREA 5 - Alerta de devolucion y calculo de dias de mora
	/** Indica si la fecha de entrega ya vencio y el vehiculo sigue activo */
	@Transient
	public boolean isAtrasado() {
		if (this.estado != EstadoAlquiler.PENDIENTE_ENTREGA && this.estado != EstadoAlquiler.ENTREGADO) {
			return false;
		}
		return this.fechaEntrega != null && this.fechaEntrega.isBefore(LocalDate.now());
	}

	@Transient
	public int getDiasAtraso() {
		if (!isAtrasado()) {
			return 0;
		}
		return (int) ChronoUnit.DAYS.between(this.fechaEntrega, LocalDate.now());
	}

	/** Dias transcurridos desde la fecha de entrega registrada */
	@Transient
	public long diasDesdeEntrega() {
		return ChronoUnit.DAYS.between(this.fechaEntrega, LocalDate.now());
	}
}
