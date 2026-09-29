import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VehiculoService } from '../servicios/vehiculo';
import { AlquilerService } from '../servicios/alquiler';
import { Sesion } from '../servicios/sesion';
import { Vehiculo } from '../entities/vehiculo';

@Component({
  selector: 'app-vehiculos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './vehiculos.html',
  styleUrl: './vehiculos.css'
})
export class Vehiculos implements OnInit {

  vehiculos: Vehiculo[] = [];
  filtroTipo = '';

  seleccion: Vehiculo | null = null;
  fechaInicio = '';
  fechaEntrega = '';
  fechaMinima = new Date().toISOString().split('T')[0];

  cargando = false;
  error = '';
  exito = '';

  private servicioVehiculos = inject(VehiculoService);
  private servicioAlquiler = inject(AlquilerService);
  private sesion = inject(Sesion);

  ngOnInit(): void {
    this.listar();
  }

  listar(): void {
    this.servicioVehiculos.listarDisponibles().subscribe({
      next: (dato) => (this.vehiculos = dato),
      error: () => (this.error = 'No se pudieron cargar los vehiculos')
    });
  }

  filtrar(): void {
    if (this.filtroTipo) {
      this.servicioVehiculos.listarDisponiblesPorTipo(this.filtroTipo).subscribe({
        next: (dato) => (this.vehiculos = dato)
      });
    } else {
      this.listar();
    }
  }

  elegir(vehiculo: Vehiculo): void {
    this.seleccion = vehiculo;
    this.error = '';
    this.exito = '';
    this.fechaInicio = '';
    this.fechaEntrega = '';
  }

  cancelarFormulario(): void {
    this.seleccion = null;
    this.fechaInicio = '';
    this.fechaEntrega = '';
    this.error = '';
    this.exito = '';
  }

  confirmar(): void {
    if (!this.fechaInicio || !this.fechaEntrega) {
      this.error = 'Seleccione la fecha de inicio y la fecha de entrega';
      return;
    }

    this.cargando = true;
    this.error = '';

    this.servicioAlquiler
      .guardarAlquiler({
        usuario: { identificacion: this.sesion.identificacion() },
        vehiculo: { id: this.seleccion!.id },
        fechaInicio: this.fechaInicio,
        fechaEntrega: this.fechaEntrega
      })
      .subscribe({
        next: (alquiler) => {
          this.cargando = false;
          this.exito =
            `Alquiler ${alquiler.numeroAlquiler} generado con estado ` +
            `"${alquiler.descripcionEstado}". Descargando PDF...`;
          this.servicioAlquiler.descargarPdf(alquiler.numeroAlquiler);
          this.listar();
        },
        error: (err) => {
          this.cargando = false;
          this.error =
            typeof err.error === 'string' && err.error ? err.error : 'Error al crear el alquiler';
        }
      });
  }
}
