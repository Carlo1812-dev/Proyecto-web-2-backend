import { Injectable, computed, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
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
    const guardado = localStorage.getItem('sesion');
    if (guardado) {
      this.actual.set(JSON.parse(guardado));
    }
  }

  ingresar(datos: { identificacion: string; password: string }): Observable<Usuario> {
    return this.http.post<Usuario>(`${this.url}ingresar/`, datos).pipe(
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
