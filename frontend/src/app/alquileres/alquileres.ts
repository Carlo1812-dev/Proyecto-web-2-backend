import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AlquilerService } from '../servicios/alquiler';
import { Sesion } from '../servicios/sesion';
import { Alquiler } from '../entities/alquiler';
import { acentoDe, fotoDe } from '../entities/fotos';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-alquileres',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './alquileres.html',
  styleUrl: './alquileres.css'
})
export class Alquileres implements OnInit {

  alquileres: Alquiler[] = [];
  cargando = false;
  error = '';
  mensaje = '';

  private servicioAlquiler = inject(AlquilerService);
  private sesion = inject(Sesion);
  private cdr = inject(ChangeDetectorRef);

  /**
   * Angular 21+ corre "zoneless": asignar this.cargando / this.alquileres
   * dentro de un callback de HTTP no refresca la pantalla. Con esto la vista
   * se pinta apenas llega la respuesta.
   */
  private refrescar(): void {
    try {
      this.cdr.detectChanges();
    } catch {
      // la vista ya fue destruida (el usuario navego fuera)
    }
  }

  get usuario(): string {
    return this.sesion.identificacion();
  }

  /** URL exacta del servicio que se esta consultando (para diagnosticar) */
  get api(): string {
    return `${environment.api}/alquiler/a/misAlquileres/`;
  }

  get sinSesion(): boolean {
    return !this.usuario;
  }

  /** Lo que se pinta en pantalla: sin los alquileres que ya se cancelaron */
  get visibles(): Alquiler[] {
    return this.alquileres.filter((a) => a.estado !== 'CANCELADO');
  }

  /** Cuantos cancelados hay escondidos (para avisarlo en el encabezado) */
  get cancelados(): number {
    return this.alquileres.length - this.visibles.length;
  }

  get total(): number {
    return this.visibles.length;
  }

  /** Foto real del vehiculo del alquiler */
  imagen(tipo: string): string {
    return fotoDe(tipo);
  }

  /** Color de acento segun el tipo de vehiculo */
  acento(tipo: string): string {
    return acentoDe(tipo);
  }

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.error = '';
    this.mensaje = '';

    if (this.sinSesion) {
      this.cargando = false;
      this.alquileres = [];
      this.error = 'No hay una sesion activa. Inicie sesion nuevamente.';
      this.refrescar();
      return;
    }

    this.cargando = true;
    this.refrescar();

    this.servicioAlquiler.misAlquileres(this.sesion.identificacion()).subscribe({
      next: (dato) => {
        this.cargando = false;
        this.alquileres = dato;
        this.refrescar();
      },
      error: (err) => {
        this.cargando = false;
        this.alquileres = [];
        this.error = this.detalleError(err, 'No se pudieron cargar los alquileres');
        this.refrescar();
      }
    });
  }

  /** Mensaje tecnico para poder diagnosticar el fallo */
  private detalleError(err: any, texto: string): string {
    if (err?.name === 'TimeoutError') {
      return `${texto}: el servidor no responde en 5 s (¿el backend sigue en el puerto 8081?).`;
    }
    if (err?.status === 0) {
      return `${texto}: no se pudo conectar con el servidor (¿el backend esta levantado en el puerto 8081?).`;
    }
    if (err?.status) {
      const detalle = typeof err.error === 'string' && err.error ? ` — ${err.error}` : '';
      return `${texto} (HTTP ${err.status})${detalle}`;
    }
    return texto;
  }

  descargar(numeroAlquiler: string): void {
    this.error = '';
    this.mensaje = '';

    this.servicioAlquiler.descargarPdf(numeroAlquiler).subscribe({
      next: () => {
        this.mensaje = `PDF del alquiler ${numeroAlquiler} descargado.`;
        this.refrescar();
      },
      error: () => {
        this.error = 'No se pudo descargar el PDF';
        this.refrescar();
      }
    });
  }

  recargar(): void {
    this.cargar();
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
    this.refrescar();

    this.servicioAlquiler
      .cancelar(alquiler.numeroAlquiler, this.sesion.identificacion())
      .subscribe({
        next: (texto) => {
          // cargar() borra los mensajes, asi que el aviso se repon despues
          this.cargar();
          this.mensaje = texto;
          this.refrescar();
        },
        error: (err) => {
          this.error =
            typeof err.error === 'string' && err.error ? err.error : 'No se pudo cancelar el alquiler';
          this.refrescar();
        }
      });
  }

  puedeCancelar(alquiler: Alquiler): boolean {
    return alquiler.estado !== 'DEVUELTO' && alquiler.estado !== 'CANCELADO';
  }
}
