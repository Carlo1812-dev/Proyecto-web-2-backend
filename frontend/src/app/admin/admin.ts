import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AlquilerService } from '../servicios/alquiler';
import { VehiculoService } from '../servicios/vehiculo';
import { Alquiler } from '../entities/alquiler';
import { Vehiculo } from '../entities/vehiculo';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin.html',
  styleUrl: './admin.css'
})
export class Admin implements OnInit {

  // Listados
  pendientes: Alquiler[] = [];
  entregados: Alquiler[] = [];
  atrasados: Alquiler[] = [];
  vehiculos: Vehiculo[] = [];
  filtroTipo = '';

  // Busquedas
  placaBuscar = '';
  numeroBuscar = '';
  alquilerEncontrado: Alquiler | null = null;

  mensaje = '';
  error = '';

  private servicioAlquiler = inject(AlquilerService);
  private servicioVehiculos = inject(VehiculoService);

  ngOnInit(): void {
    this.listarTodo();
  }

  listarTodo(): void {
    this.listarPendientes();
    this.listarEntregados();
    this.listarAtrasados();
    this.listarVehiculos();
  }

  listarPendientes(): void {
    this.servicioAlquiler.pendientes().subscribe({
      next: (dato) => (this.pendientes = dato),
      error: () => (this.error = 'Error al cargar los alquileres pendientes')
    });
  }

  listarEntregados(): void {
    this.servicioAlquiler.entregados().subscribe({
      next: (dato) => (this.entregados = dato),
      error: () => (this.error = 'Error al cargar los alquileres entregados')
    });
  }

  listarAtrasados(): void {
    this.servicioAlquiler.atrasados().subscribe({
      next: (dato) => (this.atrasados = dato),
      error: () => (this.error = 'Error al cargar las alertas de devolucion')
    });
  }

  listarVehiculos(): void {
    if (this.filtroTipo) {
      this.servicioVehiculos.listarTodoPorTipo(this.filtroTipo).subscribe({
        next: (dato) => (this.vehiculos = dato)
      });
    } else {
      this.servicioVehiculos.listarTodo().subscribe({
        next: (dato) => (this.vehiculos = dato)
      });
    }
  }

  // --------------------- Buscar por placa ---------------------

  buscarPorPlaca(): void {
    this.error = '';
    this.mensaje = '';

    if (!this.placaBuscar.trim()) {
      this.error = 'Digite el numero de placa';
      return;
    }

    const placa = this.placaBuscar.trim().toUpperCase();
    const encontrado = this.pendientes.find((a) => a.vehiculo.placa.toUpperCase() === placa);

    if (encontrado) {
      this.mensaje = `Alquiler ${encontrado.numeroAlquiler} pendiente de entrega para la placa ${placa}.`;
    } else {
      this.error = `No hay alquileres pendientes de entrega para la placa ${placa}`;
    }
  }

  /** El usuario reclama el vehiculo: cambia el estado a ENTREGADO */
  entregar(placa: string): void {
    if (!confirm(`Confirmar la entrega del vehiculo con placa ${placa}?`)) {
      return;
    }

    this.error = '';

    this.servicioAlquiler.entregar(placa).subscribe({
      next: (texto) => {
        this.mensaje = texto;
        this.placaBuscar = '';
        this.listarPendientes();
        this.listarEntregados();
        this.listarAtrasados();
        this.listarVehiculos();
      },
      error: (err) =>
        (this.error = typeof err.error === 'string' && err.error ? err.error : 'Error al entregar')
    });
  }

  // --------------- Buscar por numero de alquiler ---------------

  buscarPorNumero(): void {
    this.error = '';
    this.mensaje = '';
    this.alquilerEncontrado = null;

    if (!this.numeroBuscar.trim()) {
      this.error = 'Digite el numero de alquiler';
      return;
    }

    this.servicioAlquiler.buscarPorNumero(this.numeroBuscar.trim().toUpperCase()).subscribe({
      next: (dato) => (this.alquilerEncontrado = dato),
      error: (err) =>
        (this.error =
          typeof err.error === 'string' && err.error ? err.error : 'Alquiler no encontrado')
    });
  }

  diasExtras(alquiler: Alquiler): number {
    const hoy = new Date();
    const entrega = new Date(alquiler.fechaEntrega);
    const dias = Math.floor((hoy.getTime() - entrega.getTime()) / 86400000);
    return dias > 0 ? dias : 0;
  }

  /** Deja el vehiculo DISPONIBLE y cobra los dias posteriores si corresponde */
  devolver(alquiler: Alquiler): void {
    const extra = this.diasExtras(alquiler);
    let aviso = `¿Devolver el alquiler ${alquiler.numeroAlquiler} y dejar el vehiculo DISPONIBLE?`;

    if (extra > 0) {
      const cobro = extra * alquiler.vehiculo.valorAlquiler;
      aviso += `\n\nDevuelto con ${extra} dia(s) de atraso: cobro adicional de $${cobro.toLocaleString('es-CO')}.`;
    }

    if (!confirm(aviso)) {
      return;
    }

    this.error = '';

    this.servicioAlquiler.devolver(alquiler.numeroAlquiler).subscribe({
      next: (texto) => {
        this.mensaje = texto;
        this.alquilerEncontrado = null;
        this.numeroBuscar = '';
        this.listarPendientes();
        this.listarEntregados();
        this.listarAtrasados();
        this.listarVehiculos();
      },
      error: (err) =>
        (this.error = typeof err.error === 'string' && err.error ? err.error : 'Error al devolver')
    });
  }

  descargar(numeroAlquiler: string): void {
    this.servicioAlquiler.descargarPdf(numeroAlquiler);
  }

  get disponibles(): Vehiculo[] {
    return this.vehiculos.filter((v) => v.estado === 'DISPONIBLE');
  }

  get alquilados(): Vehiculo[] {
    return this.vehiculos.filter((v) => v.estado === 'ALQUILADO');
  }
}
