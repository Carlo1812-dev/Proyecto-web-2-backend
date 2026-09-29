import { Routes } from '@angular/router';
import { adminGuard, invitadoGuard, sesionGuard } from './guards/sesion.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () => import('./login/login').then((m) => m.Login),
    canActivate: [invitadoGuard]
  },
  {
    path: 'registro',
    loadComponent: () => import('./registro/registro').then((m) => m.Registro),
    canActivate: [invitadoGuard]
  },
  {
    path: 'vehiculos',
    loadComponent: () => import('./vehiculos/vehiculos').then((m) => m.Vehiculos),
    canActivate: [sesionGuard]
  },
  {
    path: 'alquileres',
    loadComponent: () => import('./alquileres/alquileres').then((m) => m.Alquileres),
    canActivate: [sesionGuard]
  },
  {
    path: 'admin',
    loadComponent: () => import('./admin/admin').then((m) => m.Admin),
    canActivate: [adminGuard]
  },
  { path: '**', redirectTo: '/login' }
];
