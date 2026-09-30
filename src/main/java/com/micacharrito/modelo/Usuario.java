package com.micacharrito.modelo;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonProperty.Access;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import java.time.LocalDate;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "usuarios")
public class Usuario {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(nullable = false, unique = true)
	private String identificacion;

	@Column(nullable = false)
	private String nombreCompleto;

	@Column(nullable = false)
	private LocalDate fechaExpedicionLicencia;

	@Column(nullable = false)
	private String categoriaLicencia;

	@Column(nullable = false)
	private LocalDate vigenciaLicencia;

	@Column(nullable = false)
	private String correoElectronico;

	@Column(nullable = false)
	private String numeroTelefono;

	@Column(nullable = false)
	private String password;

	// Se puede recibir en el request, pero NUNCA se devuelve en la respuesta
	@JsonProperty(access = Access.WRITE_ONLY)
	public String getPassword() {
		return password;
	}

	@Column(nullable = false)
	@Enumerated(EnumType.STRING)
	private Rol rol = Rol.USUARIO;

	public enum Rol {
		USUARIO, ADMIN
	}

	public Usuario() {
	}

	public Usuario(String identificacion, String nombreCompleto, LocalDate fechaExpedicionLicencia,
			String categoriaLicencia, LocalDate vigenciaLicencia, String correoElectronico,
			String numeroTelefono, String password) {
		this.identificacion = identificacion;
		this.nombreCompleto = nombreCompleto;
		this.fechaExpedicionLicencia = fechaExpedicionLicencia;
		this.categoriaLicencia = categoriaLicencia;
		this.vigenciaLicencia = vigenciaLicencia;
		this.correoElectronico = correoElectronico;
		this.numeroTelefono = numeroTelefono;
		this.password = password;
	}

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public String getIdentificacion() {
		return identificacion;
	}

	public void setIdentificacion(String identificacion) {
		this.identificacion = identificacion;
	}

	public String getNombreCompleto() {
		return nombreCompleto;
	}

	public void setNombreCompleto(String nombreCompleto) {
		this.nombreCompleto = nombreCompleto;
	}

	public LocalDate getFechaExpedicionLicencia() {
		return fechaExpedicionLicencia;
	}

	public void setFechaExpedicionLicencia(LocalDate fechaExpedicionLicencia) {
		this.fechaExpedicionLicencia = fechaExpedicionLicencia;
	}

	public String getCategoriaLicencia() {
		return categoriaLicencia;
	}

	public void setCategoriaLicencia(String categoriaLicencia) {
		this.categoriaLicencia = categoriaLicencia;
	}

	public LocalDate getVigenciaLicencia() {
		return vigenciaLicencia;
	}

	public void setVigenciaLicencia(LocalDate vigenciaLicencia) {
		this.vigenciaLicencia = vigenciaLicencia;
	}

	public String getCorreoElectronico() {
		return correoElectronico;
	}

	public void setCorreoElectronico(String correoElectronico) {
		this.correoElectronico = correoElectronico;
	}

	public String getNumeroTelefono() {
		return numeroTelefono;
	}

	public void setNumeroTelefono(String numeroTelefono) {
		this.numeroTelefono = numeroTelefono;
	}

	public void setPassword(String password) {
		this.password = password;
	}

	public Rol getRol() {
		return rol;
	}

	public void setRol(Rol rol) {
		this.rol = rol;
	}
}
