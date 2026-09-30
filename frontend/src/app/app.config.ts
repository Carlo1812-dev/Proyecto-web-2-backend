import {
  ApplicationConfig,
  ErrorHandler,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection
} from '@angular/core';
import { provideRouter, withNavigationErrorHandler } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { routes } from './app.routes';
import { ManejadorErrores, reportarError } from './errores';
import { interceptorTimeout } from './interceptors/timeout';

export const appConfig: ApplicationConfig = {
  providers: [
    // Angular 21+ viene "zoneless": las respuestas HTTP no refrescan la vista
    // solas. Se opta por Zone (zone.js ya esta en polyfills) y, ademas, cada
    // componente llama a ChangeDetectorRef.detectChanges() tras su HTTP.
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideBrowserGlobalErrorListeners(),
    { provide: ErrorHandler, useClass: ManejadorErrores },
    provideRouter(
      routes,
      // Si una ruta diferida (chunk) no se puede cargar, se avisa en pantalla
      // en vez de quedarse la pagina en blanco.
      withNavigationErrorHandler((error) => reportarError('No se pudo abrir la pagina', error))
    ),
    provideHttpClient(withInterceptors([interceptorTimeout]))
  ]
};
