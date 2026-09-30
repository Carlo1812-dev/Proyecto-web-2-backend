import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map, retry, timeout } from 'rxjs';
import { Alquiler, SolicitudAlquiler } from '../entities/alquiler';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AlquilerService {

  private urlAlquiler = `${environment.api}/alquiler/a/`;
  private urlAdmin = `${environment.api}/admin/ad/`;

  constructor(private http: HttpClient) {}

  // ------------------------- Usuario -------------------------

  guardarAlquiler(solicitud: SolicitudAlquiler): Observable<Alquiler> {
    return this.http.post<Alquiler>(`${this.urlAlquiler}guardarAlquiler/`, solicitud);
  }

  misAlquileres(identificacion: string): Observable<Alquiler[]> {
    const params = new HttpParams().set('identificacion', identificacion);
    // Si el servidor cierra una conexion vieja (keep-alive) y la peticion
    // queda colgada, se reintenta 2 veces antes de avisar el fallo.
    return this.http.get<Alquiler[]>(`${this.urlAlquiler}misAlquileres/`, { params }).pipe(
      timeout(5000),
      retry({ count: 2, delay: 250 })
    );
  }

  cancelar(numeroAlquiler: string, identificacion: string): Observable<string> {
    const params = new HttpParams()
      .set('numero', numeroAlquiler)
      .set('identificacion', identificacion);
    return this.http.post(`${this.urlAlquiler}cancelar/`, null, { params, responseType: 'text' });
  }

  /**
   * Descarga el PDF. Se pide el archivo como blob para que el navegador
   * lo guarde directamente (sin abrir otra pestana y sin bloqueos).
   */
  descargarPdf(numeroAlquiler: string): Observable<void> {
    const params = new HttpParams().set('numero', numeroAlquiler);
    return this.http
      .get(`${this.urlAlquiler}pdf/`, { params, responseType: 'blob' })
      .pipe(
        map((blob: Blob) => {
          const url = URL.createObjectURL(blob);
          const enlace = document.createElement('a');
          enlace.href = url;
          enlace.download = `alquiler_${numeroAlquiler}.pdf`;
          document.body.appendChild(enlace);
          enlace.click();
          document.body.removeChild(enlace);
          URL.revokeObjectURL(url);
        })
      );
  }

  // ---------------------- Administrador ----------------------

  pendientes(): Observable<Alquiler[]> {
    return this.http.get<Alquiler[]>(`${this.urlAdmin}pendientes/`);
  }

  entregados(): Observable<Alquiler[]> {
    return this.http.get<Alquiler[]>(`${this.urlAdmin}entregados/`);
  }

  atrasados(): Observable<Alquiler[]> {
    return this.http.get<Alquiler[]>(`${this.urlAdmin}atrasados/`);
  }

  buscarPorNumero(numero: string): Observable<Alquiler> {
    const params = new HttpParams().set('numero', numero);
    return this.http.get<Alquiler>(`${this.urlAdmin}buscarPorNumero/`, { params });
  }

  /** Busca por PLACA y cambia el estado del alquiler a ENTREGADO */
  entregar(placa: string): Observable<string> {
    const params = new HttpParams().set('placa', placa);
    return this.http.post(`${this.urlAdmin}entregar/`, null, { params, responseType: 'text' });
  }

  /** Busca por NUMERO DE ALQUILER y deja el vehiculo DISPONIBLE (cobra mora) */
  devolver(numeroAlquiler: string): Observable<string> {
    const params = new HttpParams().set('numero', numeroAlquiler);
    return this.http.post(`${this.urlAdmin}devolver/`, null, { params, responseType: 'text' });
  }
}
