export interface Usuario {
  id?: number;
  identificacion: string;
  nombreCompleto: string;
  fechaExpedicionLicencia?: string;
  categoriaLicencia?: string;
  vigenciaLicencia?: string;
  correoElectronico?: string;
  numeroTelefono?: string;
  password?: string;
  rol?: string;
}
