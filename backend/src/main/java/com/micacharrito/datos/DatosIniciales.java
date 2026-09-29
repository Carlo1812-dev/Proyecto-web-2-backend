package com.micacharrito.datos;

import java.time.LocalDate;

import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import com.micacharrito.modelo.Usuario;
import com.micacharrito.modelo.Vehiculo;
import com.micacharrito.repositorio.usuario;
import com.micacharrito.repositorio.vehiculo;

/**
 * Carga los datos de prueba la primera vez que se arranca el sistema
 * (solo si las tablas estan vacias).
 */
@Component
public class DatosIniciales implements CommandLineRunner {

	private final usuario repoUsuario;
	private final vehiculo repoVehiculo;
	private final PasswordEncoder passwordEncoder;

	public DatosIniciales(usuario repoUsuario, vehiculo repoVehiculo, PasswordEncoder passwordEncoder) {
		this.repoUsuario = repoUsuario;
		this.repoVehiculo = repoVehiculo;
		this.passwordEncoder = passwordEncoder;
	}

	@Override
	public void run(String... args) {

		if (this.repoUsuario.count() == 0) {
			Usuario admin = new Usuario("ADMIN-001", "Administrador General", LocalDate.of(2020, 1, 15), "A",
					LocalDate.of(2030, 12, 31), "admin@micacharrito.com", "3001112222",
					this.passwordEncoder.encode("admin123"));
			admin.setRol(Usuario.Rol.ADMIN);
			this.repoUsuario.save(admin);

			Usuario cliente = new Usuario("1234567890", "Juan Perez", LocalDate.of(2021, 6, 10), "B2",
					LocalDate.of(2027, 6, 10), "juan@email.com", "3009998888",
					this.passwordEncoder.encode("usuario123"));
			this.repoUsuario.save(cliente);
		}

		if (this.repoVehiculo.count() == 0) {
			this.repoVehiculo
					.save(new Vehiculo(Vehiculo.TipoVehiculo.AUTOMOVIL, "ABC-123", "Toyota", "Corolla", 2023, "Blanco", 80000.0));
			this.repoVehiculo
					.save(new Vehiculo(Vehiculo.TipoVehiculo.CAMIONETA, "DEF-456", "Chevrolet", "Tracker", 2024, "Negro", 120000.0));
			this.repoVehiculo
					.save(new Vehiculo(Vehiculo.TipoVehiculo.CAMPERO, "JKL-012", "Suzuki", "Jimny", 2024, "Verde", 95000.0));
			this.repoVehiculo
					.save(new Vehiculo(Vehiculo.TipoVehiculo.MICROBUS, "MNO-345", "Mercedes", "Sprinter", 2022, "Plata", 150000.0));
			this.repoVehiculo
					.save(new Vehiculo(Vehiculo.TipoVehiculo.MOTOCICLETA, "GHI-789", "Honda", "CB 190R", 2023, "Rojo", 45000.0));
		}
	}
}
