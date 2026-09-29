import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Sesion } from '../servicios/sesion';

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

  private sesion = inject(Sesion);
  private router = inject(Router);

  ingresar(): void {
    if (!this.identificacion.trim() || !this.password) {
      this.error = 'Digite su numero de identificacion y su contrasena';
      return;
    }

    this.cargando = true;
    this.error = '';

    this.sesion
      .ingresar({ identificacion: this.identificacion.trim(), password: this.password })
      .subscribe({
        next: () => {
          this.cargando = false;
          if (this.sesion.esAdmin()) {
            this.router.navigate(['/admin']);
          } else {
            this.router.navigate(['/vehiculos']);
          }
        },
        error: (err) => {
          this.cargando = false;
          this.error =
            typeof err.error === 'string' && err.error
              ? err.error
              : 'Identificacion o contrasena incorrectas';
        }
      });
  }
}
