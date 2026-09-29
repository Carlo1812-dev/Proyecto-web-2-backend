import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Vehiculo } from '../entities/vehiculo';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class VehiculoService {

  private url = `${environment.api}/vehiculo/v/`;

  constructor(private http: HttpClient) {}

  listarDisponibles(): Observable<Vehiculo[]> {
    return this.http.get<Vehiculo[]>(`${this.url}listarDisponibles/`);
  }

  listarDisponiblesPorTipo(tipo: string): Observable<Vehiculo[]> {
    const params = new HttpParams().set('tipo', tipo);
    return this.http.get<Vehiculo[]>(`${this.url}listarDisponiblesTipo/`, { params });
  }

  listarTodo(): Observable<Vehiculo[]> {
    return this.http.get<Vehiculo[]>(`${this.url}listarTodo/`);
  }

  listarTodoPorTipo(tipo: string): Observable<Vehiculo[]> {
    const params = new HttpParams().set('tipo', tipo);
    return this.http.get<Vehiculo[]>(`${this.url}listarTodoTipo/`, { params });
  }
}
