import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { VehiculoService } from '../servicios/vehiculo';
import { AlquilerService } from '../servicios/alquiler';
import { Sesion } from '../servicios/sesion';
import { Vehiculo } from '../entities/vehiculo';
import { Alquiler } from '../entities/alquiler';
import { acentoDe, fotoDe } from '../entities/fotos';

@Component({
  selector: 'app-vehiculos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './vehiculos.html',
  styleUrl: './vehiculos.css'
})
export class Vehiculos implements OnInit {

  vehiculos: Vehiculo[] = [];
  filtroTipo = '';

  /** Paginacion del listado de disponibles */
  pagina = 1;
  readonly porPagina = 8;

  seleccion: Vehiculo | null = null;
  fechaInicio = '';
  fechaEntrega = '';
  /** Fecha minima en zona horaria local (toISOString() devuelve UTC) */
  fechaMinima = (() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  })();

  alquilerCreado: Alquiler | null = null;

  cargando = false;
  error = '';
  exito = '';

  private servicioVehiculos = inject(VehiculoService);
  private servicioAlquiler = inject(AlquilerService);
  private sesion = inject(Sesion);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  /** Angular 21+ es zoneless: hay que refrescar la vista tras cada HTTP */
  private refrescar(): void {
    try {
      this.cdr.detectChanges();
    } catch {
      // vista destruida
    }
  }

  tipos: { valor: string; nombre: string }[] = [
    { valor: '', nombre: 'Todos' },
    { valor: 'AUTOMOVIL', nombre: 'Automovil' },
    { valor: 'CAMIONETA', nombre: 'Camioneta' },
    { valor: 'CAMPERO', nombre: 'Campero' },
    { valor: 'MICROBUS', nombre: 'Microbus' },
    { valor: 'MOTOCICLETA', nombre: 'Motocicleta' }
  ];

  /** Color de acento segun el tipo de vehiculo */
  acento(tipo: string): string {
    return acentoDe(tipo);
  }

  /** Foto real del vehiculo segun su tipo */
  imagen(tipo: string): string {
    return fotoDe(tipo);
  }

  ngOnInit(): void {
    this.listar();
  }

  listar(): void {
    this.servicioVehiculos.listarDisponibles().subscribe({
      next: (dato) => {
        this.vehiculos = dato;
        this.pagina = Math.min(this.pagina, this.totalPaginas);
        this.refrescar();
      },
      error: (err) => {
        this.error = this.detalleError(err, 'No se pudieron cargar los vehiculos');
        this.refrescar();
      }
    });
  }

  filtrar(): void {
    this.filtrarPor(this.filtroTipo);
  }

  filtrarPor(tipo: string): void {
    this.filtroTipo = tipo;
    this.pagina = 1;

    if (tipo) {
      this.servicioVehiculos.listarDisponiblesPorTipo(tipo).subscribe({
        next: (dato) => {
          this.vehiculos = dato;
          this.pagina = Math.min(this.pagina, this.totalPaginas);
          this.refrescar();
        }
      });
    } else {
      this.listar();
    }
  }

  // ----------------------- Paginacion -----------------------

  get totalPaginas(): number {
    return Math.max(1, Math.ceil(this.vehiculos.length / this.porPagina));
  }

  get vehiculosPagina(): Vehiculo[] {
    const inicio = (this.pagina - 1) * this.porPagina;
    return this.vehiculos.slice(inicio, inicio + this.porPagina);
  }

  get rangoVehiculos(): string {
    if (!this.vehiculos.length) {
      return '0 de 0';
    }
    const inicio = (this.pagina - 1) * this.porPagina + 1;
    const fin = Math.min(this.pagina * this.porPagina, this.vehiculos.length);
    return `${inicio}-${fin} de ${this.vehiculos.length}`;
  }

  /** Numero de botones de pagina a mostrar (ventana de 5 alrededor de la actual) */
  get paginas(): number[] {
    const total = this.totalPaginas;
    if (total <= 7) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }
    let inicio = Math.max(1, Math.min(this.pagina - 2, total - 4));
    const fin = Math.min(total, inicio + 4);
    inicio = Math.max(1, fin - 4);
    return Array.from({ length: fin - inicio + 1 }, (_, i) => inicio + i);
  }

  irAPagina(destino: number): void {
    const pagina = Math.min(Math.max(1, destino), this.totalPaginas);
    if (pagina !== this.pagina) {
      this.pagina = pagina;
      this.refrescar();
    }
  }

  elegir(vehiculo: Vehiculo): void {
    this.seleccion = vehiculo;
    this.alquilerCreado = null;
    this.error = '';
    this.exito = '';
    this.fechaInicio = '';
    this.fechaEntrega = '';
  }

  cerrarFormulario(): void {
    this.seleccion = null;
    this.alquilerCreado = null;
    this.fechaInicio = '';
    this.fechaEntrega = '';
    this.error = '';
    this.exito = '';
  }

  confirmar(): void {
    if (!this.fechaInicio || !this.fechaEntrega) {
      this.error = 'Seleccione la fecha de inicio y la fecha de entrega';
      return;
    }

    this.cargando = true;
    this.error = '';
    this.refrescar();

    this.servicioAlquiler
      .guardarAlquiler({
        usuario: { identificacion: this.sesion.identificacion() },
        vehiculo: { id: this.seleccion!.id },
        fechaInicio: this.fechaInicio,
        fechaEntrega: this.fechaEntrega
      })
      .subscribe({
        next: (alquiler) => {
          this.cargando = false;
          this.alquilerCreado = alquiler;
          this.exito = '';
          this.refrescar();
          this.listar();
        },
        error: (err) => {
          this.cargando = false;
          this.error = this.detalleError(err, 'No se pudo crear el alquiler');
          this.refrescar();
        }
      });
  }

  /** Motivo tecnico del fallo, para poder diagnosticarlo */
  private detalleError(err: any, texto: string): string {
    if (err?.name === 'TimeoutError') {
      return `${texto}: el servidor no responde en 8 s (¿el backend sigue en el puerto 8081?).`;
    }
    if (err?.status === 0) {
      return `${texto}: no se pudo conectar con el servidor (¿el backend esta en el puerto 8081?).`;
    }
    if (typeof err?.error === 'string' && err.error) {
      return err.error;
    }
    if (err?.status) {
      return `${texto} (HTTP ${err.status})`;
    }
    return texto;
  }

  /** Descarga el PDF solo cuando el usuario lo pide */
  descargarPdf(): void {
    if (!this.alquilerCreado) {
      return;
    }

    this.error = '';

    this.servicioAlquiler.descargarPdf(this.alquilerCreado.numeroAlquiler).subscribe({
      next: () => {
        this.exito = 'PDF descargado correctamente.';
        this.refrescar();
      },
      error: () => {
        this.error = 'No se pudo descargar el PDF';
        this.refrescar();
      }
    });
  }

  irAlquileres(): void {
    this.router.navigate(['/alquileres']);
  }
}
