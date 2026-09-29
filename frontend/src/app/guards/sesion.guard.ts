import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Sesion } from '../servicios/sesion';

/** Exige tener sesion iniciada */
export const sesionGuard: CanActivateFn = () => {
  const sesion = inject(Sesion);
  const router = inject(Router);

  if (sesion.iniciado()) {
    return true;
  }

  router.navigate(['/login']);
  return false;
};

/** Exige sesion iniciada y rol ADMIN */
export const adminGuard: CanActivateFn = () => {
  const sesion = inject(Sesion);
  const router = inject(Router);

  if (sesion.iniciado() && sesion.esAdmin()) {
    return true;
  }

  router.navigate(['/login']);
  return false;
};

/** El usuario no debe estar logueado (login y registro) */
export const invitadoGuard: CanActivateFn = () => {
  const sesion = inject(Sesion);
  const router = inject(Router);

  if (!sesion.iniciado()) {
    return true;
  }

  router.navigate([sesion.esAdmin() ? '/admin' : '/vehiculos']);
  return false;
};
