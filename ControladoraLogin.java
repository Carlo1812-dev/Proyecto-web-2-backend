package com.micacharrito.controlador;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.micacharrito.modelo.Usuario;
import com.micacharrito.repositorio.usuario;

@RestController
@RequestMapping("/login/l/")
public class ControladoraLogin {

	@Autowired
	private usuario repoUsuario;

	@Autowired
	private PasswordEncoder passwordEncoder;

	/** Registro de un nuevo usuario del sistema */
	@PostMapping("/registrar/")
	public ResponseEntity<?> registrar(@RequestBody Usuario peticion) {

		String identificacion = peticion.getIdentificacion() == null ? "" : peticion.getIdentificacion().trim();
		String password = peticion.getPassword() == null ? "" : peticion.getPassword().trim();

		if (identificacion.isEmpty()) {
			return ResponseEntity.badRequest().body("El numero de identificacion es obligatorio");
		}
		if (peticion.getNombreCompleto() == null || peticion.getNombreCompleto().trim().isEmpty()) {
			return ResponseEntity.badRequest().body("El nombre completo es obligatorio");
		}
		if (peticion.getFechaExpedicionLicencia() == null) {
			return ResponseEntity.badRequest().body("La fecha de expedicion de la licencia es obligatoria");
		}
		if (peticion.getCategoriaLicencia() == null || peticion.getCategoriaLicencia().trim().isEmpty()) {
			return ResponseEntity.badRequest().body("La categoria de la licencia es obligatoria");
		}
		if (peticion.getVigenciaLicencia() == null) {
			return ResponseEntity.badRequest().body("La vigencia de la licencia es obligatoria");
		}
		if (peticion.getCorreoElectronico() == null || peticion.getCorreoElectronico().trim().isEmpty()) {
			return ResponseEntity.badRequest().body("El correo electronico es obligatorio");
		}
		if (peticion.getNumeroTelefono() == null || peticion.getNumeroTelefono().trim().isEmpty()) {
			return ResponseEntity.badRequest().body("El numero de telefono es obligatorio");
		}
		if (password.isEmpty()) {
			return ResponseEntity.badRequest().body("La contrasena es obligatoria");
		}
		if (password.length() < 6) {
			return ResponseEntity.badRequest().body("La contrasena debe tener al menos 6 caracteres");
		}

		if (this.repoUsuario.existsByIdentificacion(identificacion)) {
			return ResponseEntity.badRequest().body("Ya existe un usuario con la identificacion " + identificacion);
		}

		Usuario nuevo = new Usuario(identificacion, peticion.getNombreCompleto().trim(),
				peticion.getFechaExpedicionLicencia(), peticion.getCategoriaLicencia().trim(),
				peticion.getVigenciaLicencia(), peticion.getCorreoElectronico().trim(),
				peticion.getNumeroTelefono().trim(), this.passwordEncoder.encode(password));

		// El rol siempre lo define el sistema, nunca el cliente
		nuevo.setRol(Usuario.Rol.USUARIO);

		this.repoUsuario.save(nuevo);
		nuevo.setPassword(null);
		return ResponseEntity.ok(nuevo);
	}

	/** Ingreso al sistema con identificacion y contrasena */
	@PostMapping("/ingresar/")
	public ResponseEntity<?> ingresar(@RequestBody Usuario peticion) {

		String identificacion = peticion.getIdentificacion() == null ? "" : peticion.getIdentificacion().trim();
		String password = peticion.getPassword() == null ? "" : peticion.getPassword();

		Usuario u = this.repoUsuario.findByIdentificacion(identificacion).orElse(null);

		if (u == null || !this.passwordEncoder.matches(password, u.getPassword())) {
			return ResponseEntity.badRequest().body("Identificacion o contrasena incorrectas");
		}

		u.setPassword(null);
		return ResponseEntity.ok(u);
	}
}
