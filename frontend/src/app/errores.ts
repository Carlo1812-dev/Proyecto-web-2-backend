import { ErrorHandler, signal } from '@angular/core';

export interface ErrorVisto {
  titulo: string;
  mensaje: string;
  detalle: string;
  hora: string;
}

/**
 * Ultimo error capturado. Se muestra en la barra de la app para que un
 * error de la interfaz nunca se traduzca en una pagina en blanco.
 */
export const ultimoError = signal<ErrorVisto | null>(null);

export function limpiarError(): void {
  ultimoError.set(null);
}

function texto(error: any): string {
  if (typeof error === 'string') {
    return error;
  }
  if (error instanceof Error) {
    return error.message || error.name;
  }
  if (error?.rejection instanceof Error) {
    return error.rejection.message || String(error.rejection);
  }
  if (error?.error instanceof Error) {
    return error.error.message;
  }
  if (error?.message) {
    return String(error.message);
  }
  try {
    return JSON.stringify(error);
  } catch {
    return String(error);
  }
}

function pila(error: any): string {
  const crudo = error?.rejection?.stack || error?.stack || error?.rejection || error;
  try {
    return typeof crudo === 'string' ? crudo : JSON.stringify(crudo);
  } catch {
    return String(crudo);
  }
}

let ultimoAviso = 0;

export function reportarError(titulo: string, error: any): void {
  console.error(`[${titulo}]`, error);
  // diferido para no disparar "expression changed" durante la deteccion de cambios
  setTimeout(() => {
    ultimoAviso++;
    const token = ultimoAviso;
    ultimoError.set({
      titulo,
      mensaje: texto(error),
      detalle: pila(error),
      hora: new Date().toLocaleTimeString()
    });
    // el aviso se borra solo a los 25 s para que no quede un error viejo
    setTimeout(() => {
      if (token === ultimoAviso) {
        ultimoError.set(null);
      }
    }, 25000);
  }, 0);
}

/** ErrorHandler global: captura cualquier error de Angular en runtime */
export class ManejadorErrores implements ErrorHandler {
  handleError(error: any): void {
    reportarError('Error de la aplicacion', error);
  }
}
