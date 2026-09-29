import { Usuario } from './usuario';
import { Vehiculo } from './vehiculo';

export interface Alquiler {
  id?: number;
  numeroAlquiler: string;
  usuario: Usuario;
  vehiculo: Vehiculo;
  fechaInicio: string;
  fechaEntrega: string;
  valorTotal: number;
  estado: string;
  descripcionEstado: string;
  diasMora: number;
  valorMora: number;
  atrasado: boolean;
  diasAtraso: number;
}

export interface SolicitudAlquiler {
  usuario: { identificacion: string };
  vehiculo: { id: number };
  fechaInicio: string;
  fechaEntrega: string;
}
