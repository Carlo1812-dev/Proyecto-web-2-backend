import { Injectable, computed, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, retry, tap, timeout } from 'rxjs';
import { Usuario } from '../entities/usuario';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class Sesion {

  private url = `${environment.api}/login/l/`;

  private actual = signal<Usuario | null>(null);

  usuario = this.actual.asReadonly();
  iniciado = computed(() => this.actual() !== null);
  esAdmin = computed(() => this.actual()?.rol === 'ADMIN');

  constructor(private http: HttpClient, private router: Router) {
    // Un localStorage corrupto no debe tumbar la aplicacion al arrancar
    try {
      const guardado = localStorage.getItem('sesion');
      if (guardado) {
        const datos = JSON.parse(guardado);
        if (datos && typeof datos === 'object' && datos.identificacion) {
          this.actual.set(datos);
        } else {
          localStorage.removeItem('sesion');
        }
      }
    } catch {
      localStorage.removeItem('sesion');
    }
  }

  ingresar(datos: { identificacion: string; password: string }): Observable<Usuario> {
    // Corta a los 15 s: si el servidor no responde, el boton no se queda
    // eternamente en "Ingresando...".
    return this.http.post<Usuario>(`${this.url}ingresar/`, datos).pipe(
      timeout(5000),
      retry({ count: 2, delay: 250 }),
      tap((usuario) => {
        localStorage.setItem('sesion', JSON.stringify(usuario));
        this.actual.set(usuario);
      })
    );
  }

  cerrar(): void {
    localStorage.removeItem('sesion');
    this.actual.set(null);
    this.router.navigate(['/login']);
  }

  identificacion(): string {
    return this.actual()?.identificacion || '';
  }
}
