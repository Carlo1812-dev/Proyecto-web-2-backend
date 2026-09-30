import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Navegacion } from './navegacion/navegacion';
import { limpiarError, ultimoError } from './errores';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [Navegacion, RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  readonly error = ultimoError;
  readonly cerrar = limpiarError;

  recargar(): void {
    window.location.reload();
  }
}
