import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Sesion } from '../servicios/sesion';

@Component({
  selector: 'app-navegacion',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './navegacion.html',
  styleUrl: './navegacion.css'
})
export class Navegacion {

  sesion = inject(Sesion);

  cerrarSesion(): void {
    this.sesion.cerrar();
  }
}
