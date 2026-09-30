import { Component, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { UsuarioService } from '../servicios/usuario';
import { Usuario } from '../entities/usuario';
import { fotoDe } from '../entities/fotos';

interface FormularioRegistro {
  identificacion: string;
  nombreCompleto: string;
  fechaExpedicionLicencia: string;
  categoriaLicencia: string;
  vigenciaLicencia: string;
  correoElectronico: string;
  numeroTelefono: string;
  password: string;
}

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './registro.html',
  styleUrl: './registro.css'
})
export class Registro {

  usuario: FormularioRegistro = {
    identificacion: '',
    nombreCompleto: '',
    fechaExpedicionLicencia: '',
    categoriaLicencia: '',
    vigenciaLicencia: '',
    correoElectronico: '',
    numeroTelefono: '',
    password: ''
  };

  confirmarPassword = '';
  cargando = false;
  error = '';
  exito = '';
  foto = fotoDe('CAMIONETA');

  /** Hoy en zona horaria local (toISOString() devuelve UTC) */
  hoy = (() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  })();

  private servicio = inject(UsuarioService);
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

  registrar(): void {
    this.error = '';
    this.exito = '';

    const u = this.usuario;

    if (!u.identificacion.trim()) {
      this.error = 'El numero de identificacion es obligatorio';
      return;
    }
    if (!u.nombreCompleto.trim()) {
      this.error = 'El nombre completo es obligatorio';
      return;
    }
    if (!u.fechaExpedicionLicencia) {
      this.error = 'La fecha de expedicion de la licencia es obligatoria';
      return;
    }
    if (!u.categoriaLicencia) {
      this.error = 'Seleccione la categoria de la licencia';
      return;
    }
    if (!u.vigenciaLicencia) {
      this.error = 'La vigencia de la licencia es obligatoria';
      return;
    }
    if (!u.correoElectronico.trim()) {
      this.error = 'El correo electronico es obligatorio';
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(u.correoElectronico.trim())) {
      this.error = 'Digite un correo electronico valido';
      return;
    }
    if (!u.numeroTelefono.trim()) {
      this.error = 'El numero de telefono es obligatorio';
      return;
    }
    if (!u.password || u.password.length < 6) {
      this.error = 'La contrasena debe tener al menos 6 caracteres';
      return;
    }
    if (u.password !== this.confirmarPassword) {
      this.error = 'Las contrasenas no coinciden';
      return;
    }

    const datos: Usuario = {
      identificacion: u.identificacion.trim(),
      nombreCompleto: u.nombreCompleto.trim(),
      fechaExpedicionLicencia: u.fechaExpedicionLicencia,
      categoriaLicencia: u.categoriaLicencia,
      vigenciaLicencia: u.vigenciaLicencia,
      correoElectronico: u.correoElectronico.trim(),
      numeroTelefono: u.numeroTelefono.trim(),
      password: u.password
    };

    this.cargando = true;
    this.refrescar();

    this.servicio.registrar(datos).subscribe({
      next: () => {
        this.cargando = false;
        this.exito = 'Usuario registrado correctamente. Ya puede iniciar sesion.';
        this.refrescar();
        setTimeout(() => this.router.navigate(['/login']), 1500);
      },
      error: (err) => {
        this.cargando = false;
        this.error =
          typeof err.error === 'string' && err.error ? err.error : 'No se pudo registrar el usuario';
        this.refrescar();
      }
    });
  }
}
