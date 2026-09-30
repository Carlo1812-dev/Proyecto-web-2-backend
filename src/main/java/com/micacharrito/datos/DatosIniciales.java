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
 * Carga los datos de prueba la primera vez que se arranca el sistema.
 * Los usuarios se crean solo si la tabla esta vacia; los vehiculos se agregan
 * solo si su placa no existe, de modo que se puedan ampliar el catalogo sin
 * duplicar lo que ya esta en la base de datos.
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

	// TAREA 1 - Iniciar el proyecto en Angular y Conectar con la base de datos
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

		cargarCatalogo();
	}

	/**
	 * Catalogo de prueba: 5 vehiculos por categoria (25 en total).
	 * Solo se inserta la placa que falte.
	 */
	private void cargarCatalogo() {

		// ------------------------- AUTOMOVIL -------------------------
		siFalta(Vehiculo.TipoVehiculo.AUTOMOVIL, "ABC-123", "Toyota", "Corolla", 2023, "Blanco", 80000.0);
		siFalta(Vehiculo.TipoVehiculo.AUTOMOVIL, "AUT-101", "Kia", "K3", 2024, "Blanco", 70000.0);
		siFalta(Vehiculo.TipoVehiculo.AUTOMOVIL, "AUT-102", "Renault", "Logan", 2023, "Gris", 65000.0);
		siFalta(Vehiculo.TipoVehiculo.AUTOMOVIL, "AUT-103", "Mazda", "Mazda 3", 2024, "Rojo", 95000.0);
		siFalta(Vehiculo.TipoVehiculo.AUTOMOVIL, "AUT-104", "Nissan", "Versa", 2023, "Azul", 72000.0);

		// ------------------------- CAMIONETA -------------------------
		siFalta(Vehiculo.TipoVehiculo.CAMIONETA, "DEF-456", "Chevrolet", "Tracker", 2024, "Negro", 120000.0);
		siFalta(Vehiculo.TipoVehiculo.CAMIONETA, "CAM-201", "Toyota", "Hilux", 2023, "Blanco", 150000.0);
		siFalta(Vehiculo.TipoVehiculo.CAMIONETA, "CAM-202", "Ford", "Ranger", 2024, "Gris", 165000.0);
		siFalta(Vehiculo.TipoVehiculo.CAMIONETA, "CAM-203", "Mazda", "CX-5", 2023, "Azul", 140000.0);
		siFalta(Vehiculo.TipoVehiculo.CAMIONETA, "CAM-204", "Chevrolet", "D-Max", 2024, "Rojo", 145000.0);

		// -------------------------- CAMPERO --------------------------
		siFalta(Vehiculo.TipoVehiculo.CAMPERO, "JKL-012", "Suzuki", "Jimny", 2024, "Verde", 95000.0);
		siFalta(Vehiculo.TipoVehiculo.CAMPERO, "CMP-301", "Toyota", "Land Cruiser Prado", 2023, "Blanco", 180000.0);
		siFalta(Vehiculo.TipoVehiculo.CAMPERO, "CMP-302", "Jeep", "Wrangler", 2024, "Verde", 200000.0);
		siFalta(Vehiculo.TipoVehiculo.CAMPERO, "CMP-303", "Mitsubishi", "Pajero", 2022, "Gris", 155000.0);
		siFalta(Vehiculo.TipoVehiculo.CAMPERO, "CMP-304", "Suzuki", "Vitara", 2023, "Azul", 110000.0);

		// -------------------------- MICROBUS -------------------------
		siFalta(Vehiculo.TipoVehiculo.MICROBUS, "MNO-345", "Mercedes", "Sprinter", 2022, "Plata", 150000.0);
		siFalta(Vehiculo.TipoVehiculo.MICROBUS, "MIC-401", "Renault", "Master", 2023, "Gris", 160000.0);
		siFalta(Vehiculo.TipoVehiculo.MICROBUS, "MIC-402", "Ford", "Transit", 2024, "Azul", 168000.0);
		siFalta(Vehiculo.TipoVehiculo.MICROBUS, "MIC-403", "Iveco", "Daily", 2022, "Blanco", 150000.0);
		siFalta(Vehiculo.TipoVehiculo.MICROBUS, "MIC-404", "Mercedes", "Sprinter 316", 2024, "Blanco", 175000.0);

		// ------------------------- MOTOCICLETA -----------------------
		siFalta(Vehiculo.TipoVehiculo.MOTOCICLETA, "GHI-789", "Honda", "CB 190R", 2023, "Rojo", 45000.0);
		siFalta(Vehiculo.TipoVehiculo.MOTOCICLETA, "MOT-501", "Yamaha", "FZ 25", 2023, "Azul", 35000.0);
		siFalta(Vehiculo.TipoVehiculo.MOTOCICLETA, "MOT-502", "Bajaj", "Pulsar NS200", 2024, "Negro", 38000.0);
		siFalta(Vehiculo.TipoVehiculo.MOTOCICLETA, "MOT-503", "Suzuki", "Gixxer 250", 2023, "Rojo", 42000.0);
		siFalta(Vehiculo.TipoVehiculo.MOTOCICLETA, "MOT-504", "Kawasaki", "Ninja 300", 2022, "Verde", 55000.0);
	}

	/** Guarda el vehiculo unicamente si su placa todavia no existe */
	private void siFalta(Vehiculo.TipoVehiculo tipo, String placa, String marca, String modelo, int anio, String color,
			double valorAlquiler) {
		if (!this.repoVehiculo.existsByPlaca(placa)) {
			this.repoVehiculo
					.save(new Vehiculo(tipo, placa, marca, modelo, anio, color, valorAlquiler));
		}
	}
}
