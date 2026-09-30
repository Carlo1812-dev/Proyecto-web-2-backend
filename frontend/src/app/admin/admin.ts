import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { AlquilerService } from '../servicios/alquiler';
import { VehiculoService } from '../servicios/vehiculo';
import { Alquiler } from '../entities/alquiler';
import { Vehiculo } from '../entities/vehiculo';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin.html',
  styleUrl: './admin.css'
})
export class Admin implements OnInit {

  /** Paso 1: alquileres creados que aun no se han entregado */
  pendientes: Alquiler[] = [];
  /** Paso 3: alquileres ya en poder del usuario */
  entregados: Alquiler[] = [];
  /** Paso 3: alquileres con la fecha de entrega vencida */
  atrasados: Alquiler[] = [];
  /** Inventario completo (para los indicadores y la tabla de disponibles) */
  vehiculos: Vehiculo[] = [];
  filtroTipo = '';

  /** Paginacion de la tabla de disponibles */
  paginaDisponibles = 1;
  readonly porPagina = 8;

  /** Paso 2: busqueda por placa */
  placaBuscar = '';
  placaEncontrado: Alquiler | null = null;

  /** Paso 3: busqueda por numero de alquiler */
  numeroBuscar = '';
  alquilerEncontrado: Alquiler | null = null;

  /** Confirmacion en linea: reemplaza al alert() del navegador */
  porConfirmar: { accion: 'entregar' | 'devolver'; alquiler: Alquiler } | null = null;

  mensaje = '';
  error = '';

  private servicioAlquiler = inject(AlquilerService);
  private servicioVehiculos = inject(VehiculoService);
  private cdr = inject(ChangeDetectorRef);

  /** Angular 21+ es zoneless: hay que refrescar la vista tras cada HTTP */
  private refrescar(): void {
    try {
      this.cdr.detectChanges();
    } catch {
      // vista destruida
    }
  }

  ngOnInit(): void {
    this.listarTodo();
  }

  listarTodo(): void {
    this.error = '';
    this.cargar(this.servicioAlquiler.pendientes(), (d) => (this.pendientes = d), 'los alquileres pendientes');
    this.cargar(this.servicioAlquiler.entregados(), (d) => (this.entregados = d), 'los alquileres entregados');
    this.cargar(this.servicioAlquiler.atrasados(), (d) => (this.atrasados = d), 'las alertas de devolucion');
    this.cargar(this.servicioVehiculos.listarTodo(), (d) => {
      this.vehiculos = d;
      this.paginaDisponibles = Math.min(this.paginaDisponibles, this.totalPaginasDisponibles);
    }, 'el inventario de vehiculos');
  }

  private cargar<T>(fuente: Observable<T>, destino: (d: T) => void, que: string): void {
    fuente.subscribe({
      next: (dato) => {
        destino(dato);
        this.refrescar();
      },
      error: () => {
        this.error = `No se pudo cargar ${que}`;
        this.refrescar();
      }
    });
  }

  // ------------------------- Indicadores -------------------------

  get disponibles(): Vehiculo[] {
    return this.vehiculos.filter(
      (v) => v.estado === 'DISPONIBLE' && (!this.filtroTipo || v.tipo === this.filtroTipo)
    );
  }

  get disponiblesTotal(): number {
    return this.vehiculos.filter((v) => v.estado === 'DISPONIBLE').length;
  }

  get alquilados(): Vehiculo[] {
    return this.vehiculos.filter((v) => v.estado === 'ALQUILADO');
  }

  get tipos(): { valor: string; texto: string }[] {
    return [
      { valor: '', texto: 'Todos los tipos' },
      { valor: 'AUTOMOVIL', texto: 'Automovil' },
      { valor: 'CAMIONETA', texto: 'Camioneta' },
      { valor: 'CAMPERO', texto: 'Campero' },
      { valor: 'MICROBUS', texto: 'Microbus' },
      { valor: 'MOTOCICLETA', texto: 'Motocicleta' }
    ];
  }

  // ----------------------- Paginacion -----------------------

  get totalPaginasDisponibles(): number {
    return Math.max(1, Math.ceil(this.disponibles.length / this.porPagina));
  }

  get disponiblesPagina(): Vehiculo[] {
    const inicio = (this.paginaDisponibles - 1) * this.porPagina;
    return this.disponibles.slice(inicio, inicio + this.porPagina);
  }

  get rangoDisponibles(): string {
    if (!this.disponibles.length) {
      return '0 de 0';
    }
    const inicio = (this.paginaDisponibles - 1) * this.porPagina + 1;
    const fin = Math.min(this.paginaDisponibles * this.porPagina, this.disponibles.length);
    return `${inicio}-${fin} de ${this.disponibles.length}`;
  }

  /** Numero de botones de pagina a mostrar (ventana de 5 alrededor de la actual) */
  get paginasDisponibles(): number[] {
    const total = this.totalPaginasDisponibles;
    if (total <= 7) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }
    let inicio = Math.max(1, Math.min(this.paginaDisponibles - 2, total - 4));
    const fin = Math.min(total, inicio + 4);
    inicio = Math.max(1, fin - 4);
    return Array.from({ length: fin - inicio + 1 }, (_, i) => inicio + i);
  }

  cambiarFiltro(tipo: string): void {
    this.filtroTipo = tipo;
    this.paginaDisponibles = 1;
    this.refrescar();
  }

  irAPaginaDisponibles(pagina: number): void {
    const destino = Math.min(Math.max(1, pagina), this.totalPaginasDisponibles);
    if (destino !== this.paginaDisponibles) {
      this.paginaDisponibles = destino;
      this.refrescar();
    }
  }

  // --------------------- Paso 2: entrega ---------------------

  /** El administrador busca en el sistema por el numero de placa */
  buscarPorPlaca(): void {
    this.error = '';
    this.mensaje = '';
    this.placaEncontrado = null;
    this.porConfirmar = null;

    const placa = this.placaBuscar.trim().toUpperCase();
    if (!placa) {
      this.error = 'Digite el numero de placa';
      this.refrescar();
      return;
    }

    const encontrada = this.pendientes.find((a) => a.vehiculo.placa.toUpperCase() === placa);

    if (!encontrada) {
      this.error = this.vehiculos.some((v) => v.placa.toUpperCase() === placa)
        ? `El vehiculo ${placa} no tiene alquileres pendientes de entrega`
        : `No existe ningun vehiculo con la placa ${placa}`;
      this.refrescar();
      return;
    }

    this.placaEncontrado = encontrada;
    this.refrescar();
  }

  pedirEntrega(alquiler: Alquiler): void {
    this.error = '';
    this.mensaje = '';
    this.porConfirmar = { accion: 'entregar', alquiler };
    this.refrescar();
  }

  /** Cambia el estado del alquiler a ENTREGADO */
  private ejecutarEntrega(alquiler: Alquiler): void {
    this.servicioAlquiler.entregar(alquiler.vehiculo.placa).subscribe({
      next: (texto) => {
        this.mensaje = texto;
        this.placaBuscar = '';
        this.placaEncontrado = null;
        this.listarTodo();
        this.refrescar();
      },
      error: (err) => {
        this.error = typeof err.error === 'string' && err.error ? err.error : 'Error al entregar';
        this.refrescar();
      }
    });
  }

  // --------------------- Paso 3: devolucion ---------------------

  buscarPorNumero(): void {
    this.error = '';
    this.mensaje = '';
    this.alquilerEncontrado = null;
    this.porConfirmar = null;

    const numero = this.numeroBuscar.trim().toUpperCase();
    if (!numero) {
      this.error = 'Digite el numero de alquiler';
      this.refrescar();
      return;
    }

    this.servicioAlquiler.buscarPorNumero(numero).subscribe({
      next: (dato) => {
        this.alquilerEncontrado = dato;
        this.refrescar();
      },
      error: (err) => {
        this.error =
          typeof err.error === 'string' && err.error ? err.error : 'Alquiler no encontrado';
        this.refrescar();
      }
    });
  }

  /** Rellena la busqueda desde la lista de atrasos */
  buscarAtraso(alquiler: Alquiler): void {
    this.numeroBuscar = alquiler.numeroAlquiler;
    this.buscarPorNumero();
  }

  diasExtras(alquiler: Alquiler): number {
    if (!alquiler || !alquiler.fechaEntrega) {
      return 0;
    }
    const dias = Math.round(
      (this.fechaHoy().getTime() - this.fechaLocal(alquiler.fechaEntrega).getTime()) / 86400000
    );
    return dias > 0 ? dias : 0;
  }

  /**
   * Convierte "yyyy-mm-dd" a una fecha LOCAL. `new Date("yyyy-mm-dd")`
   * se interpreta en UTC y en America/Bogota se corre un dia hacia atras,
   * lo que sumaba un dia de mora de mas frente al backend.
   */
  private fechaLocal(texto: string): Date {
    const [anio, mes, dia] = texto.split('-').map(Number);
    return new Date(anio, (mes || 1) - 1, dia || 1);
  }

  private fechaHoy(): Date {
    const hoy = new Date();
    return new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
  }

  /** Dias posteriores cobrados por la fecha de entrega registrada */
  valorExtra(alquiler: Alquiler): number {
    return this.diasExtras(alquiler) * (alquiler?.vehiculo?.valorAlquiler ?? 0);
  }

  /** Total a cobrar si se devuelve hoy */
  totalFinal(alquiler: Alquiler): number {
    return (alquiler?.valorTotal ?? 0) + this.valorExtra(alquiler);
  }

  pedirDevolucion(alquiler: Alquiler): void {
    this.error = '';
    this.mensaje = '';
    this.porConfirmar = { accion: 'devolver', alquiler };
    this.refrescar();
  }

  /** Deja el vehiculo DISPONIBLE y cobra los dias posteriores si corresponde */
  private ejecutarDevolucion(alquiler: Alquiler): void {
    this.servicioAlquiler.devolver(alquiler.numeroAlquiler).subscribe({
      next: (texto) => {
        this.mensaje = texto;
        this.numeroBuscar = '';
        this.alquilerEncontrado = null;
        this.listarTodo();
        this.refrescar();
      },
      error: (err) => {
        this.error = typeof err.error === 'string' && err.error ? err.error : 'Error al devolver';
        this.refrescar();
      }
    });
  }

  // ----------------------- Confirmacion -----------------------

  esConfirmacion(accion: 'entregar' | 'devolver', alquiler: Alquiler): boolean {
    return !!this.porConfirmar && this.porConfirmar.accion === accion &&
      this.porConfirmar.alquiler.id === alquiler.id;
  }

  confirmar(): void {
    if (!this.porConfirmar) {
      return;
    }
    const { accion, alquiler } = this.porConfirmar;
    this.porConfirmar = null;
    if (accion === 'entregar') {
      this.ejecutarEntrega(alquiler);
    } else {
      this.ejecutarDevolucion(alquiler);
    }
  }

  cancelarConfirmacion(): void {
    this.porConfirmar = null;
    this.refrescar();
  }

  descargar(numeroAlquiler: string): void {
    this.servicioAlquiler.descargarPdf(numeroAlquiler).subscribe({
      next: () => {
        this.mensaje = `PDF del alquiler ${numeroAlquiler} descargado.`;
        this.refrescar();
      },
      error: () => {
        this.error = 'No se pudo descargar el PDF';
        this.refrescar();
      }
    });
  }
}
