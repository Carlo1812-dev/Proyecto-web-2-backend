import { Component, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Sesion } from '../servicios/sesion';
import { fotoDe } from '../entities/fotos';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {

  identificacion = '';
  password = '';
  cargando = false;
  error = '';
  foto = fotoDe('AUTOMOVIL');

  private sesion = inject(Sesion);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  /** Angular 21+ es zoneless: hay que refrescar la vista tras cada HTTP */
  private refrescar(): void {
    try {
      this.cdr.detectChanges();
    } catch {
      // vista destruida
    }
  }

  ingresar(): void {
    if (!this.identificacion.trim() || !this.password) {
      this.error = 'Digite su numero de identificacion y su contrasena';
      return;
    }

    this.cargando = true;
    this.error = '';
    this.refrescar();

    this.sesion
      .ingresar({ identificacion: this.identificacion.trim(), password: this.password })
      .subscribe({
        next: () => {
          this.cargando = false;
          this.refrescar();
          if (this.sesion.esAdmin()) {
            this.router.navigate(['/admin']);
          } else {
            this.router.navigate(['/vehiculos']);
          }
        },
        error: (err) => {
          this.cargando = false;
          this.error = this.mensajeError(err);
          this.refrescar();
        }
      });
  }

  private mensajeError(err: any): string {
    if (err?.name === 'TimeoutError') {
      return (
        `El servidor no responde tras 5 s (${environment.api}). ` +
        `Cierre por completo el navegador y vuelva a abrirlo.`
      );
    }
    if (err?.status === 0) {
      return (
        `No se pudo conectar con el servidor (${environment.api}). ` +
        `Revise que el backend este corriendo en el puerto 8081.`
      );
    }
    if (typeof err?.error === 'string' && err.error) {
      return `${err.error} (cuenta: ${this.identificacion.trim() || 'vacia'})`;
    }
    if (err?.status) {
      return `Error HTTP ${err.status} al iniciar sesion.`;
    }
    return 'No se pudo iniciar sesion';
  }
}
