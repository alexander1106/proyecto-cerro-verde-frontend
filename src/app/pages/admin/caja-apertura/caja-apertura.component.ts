import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CajaService } from '../../../service/caja.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-caja-apertura',
  templateUrl: './caja-apertura.component.html',
  standalone: false,
  styleUrls: ['./caja-apertura.component.css']
})

export class CajaAperturaComponent implements OnInit {
  monto: number = 0;
  historial: any[] = [];
  cajaAperturada: any = null;

  constructor(private cajaService:CajaService, private router: Router) {}

  ngOnInit() {
    this.obtenerHistorial();
    this.obtenerCajaAperturada();
  }

  aperturar() {
    if (this.monto <= 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Monto inválido',
        text: 'Por favor ingrese un monto mayor a cero',
      });
      return;
    }
  
    if (this.cajaAperturada) {
      Swal.fire({
        icon: 'info',
        title: 'Ya hay una caja aperturada',
        text: 'No puede aperturar una nueva caja mientras haya una activa.',
        confirmButtonText: 'Aceptar'
      });
      return;
    }
  
    Swal.fire({
      title: '¿Estás seguro de aperturar una caja?',
      text: `Monto de apertura: S/. ${this.monto.toFixed(2)}`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, aperturar',
      cancelButtonText: 'Cancelar'
    }).then(result => {
      if (result.isConfirmed) {
        this.cajaService.aperturarCaja(this.monto).subscribe({
          next: () => {
            Swal.fire({
              icon: 'success',
              title: 'Caja aperturada correctamente',
              showConfirmButton: false,
              timer: 1500
            });
            this.router.navigate(['/admin/detalle-caja']);
          },
          error: err => {
            Swal.fire({
              icon: 'error',
              title: 'Error al aperturar',
              text: err.error || 'Ocurrió un error inesperado.'
            });
          }
        });
      }
    });
  }  

  obtenerCajaAperturada() {
    this.cajaService.obtenerCajaAperturada().subscribe({
      next: data => this.cajaAperturada = data,
      error: () => this.cajaAperturada = null
    });
  }
  
  obtenerHistorial() {
    this.cajaService.obtenerHistorial().subscribe(data => {
      this.historial = data as any[];
    });
  }
}
