import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AlquilerService } from '../servicios/alquiler';
import { Sesion } from '../servicios/sesion';
import { Alquiler } from '../entities/alquiler';

@Component({
  selector: 'app-alquileres',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './alquileres.html',
  styleUrl: './alquileres.css'
})
export class Alquileres implements OnInit {

  alquileres: Alquiler[] = [];
  error = '';
  mensaje = '';

  private servicioAlquiler = inject(AlquilerService);
  private sesion = inject(Sesion);

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.servicioAlquiler.misAlquileres(this.sesion.identificacion()).subscribe({
      next: (dato) => (this.alquileres = dato),
      error: () => (this.error = 'Error al cargar los alquileres')
    });
  }

  descargar(numeroAlquiler: string): void {
    this.servicioAlquiler.descargarPdf(numeroAlquiler);
  }

  cancelar(alquiler: Alquiler): void {
    const confirmar = confirm(
      `¿Esta seguro de cancelar el alquiler ${alquiler.numeroAlquiler}? El vehiculo volvera a estar disponible.`
    );
    if (!confirmar) {
      return;
    }

    this.error = '';
    this.mensaje = '';

    this.servicioAlquiler
      .cancelar(alquiler.numeroAlquiler, this.sesion.identificacion())
      .subscribe({
        next: (texto) => {
          this.mensaje = texto;
          this.cargar();
        },
        error: (err) => {
          this.error =
            typeof err.error === 'string' && err.error ? err.error : 'No se pudo cancelar el alquiler';
        }
      });
  }

  puedeCancelar(alquiler: Alquiler): boolean {
    return alquiler.estado !== 'DEVUELTO' && alquiler.estado !== 'CANCELADO';
  }
}
