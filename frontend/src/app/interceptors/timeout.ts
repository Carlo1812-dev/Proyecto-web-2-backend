import { HttpInterceptorFn } from '@angular/common/http';
import { timeout } from 'rxjs';

/**
 * Ninguna peticion puede quedar colgada para siempre: a los 8 s se corta
 * y el componente muestra el motivo en pantalla.
 */
export const interceptorTimeout: HttpInterceptorFn = (req, siguiente) => {
  return siguiente(req).pipe(timeout(8000));
};
