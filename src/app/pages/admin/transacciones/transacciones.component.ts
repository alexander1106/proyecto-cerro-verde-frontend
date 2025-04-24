import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CajaService } from '../../services/caja.service';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';

@Component({
  selector: 'app-transacciones',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './transacciones.component.html',
  styleUrls: ['./transacciones.component.css']
})
export class TransaccionesComponent implements OnInit {
  transacciones: any[] = [];
  nuevaTransaccion = {
    montoTransaccion: null,
    tipo: {
      id: 1
    }
  };

  constructor(private cajaService: CajaService, private router: Router) {}

  ngOnInit() {
    this.cargarTransacciones();
  }

  cargarTransacciones() {
    this.cajaService.obtenerTransaccionesCajaActual().subscribe((data: any) => {
      this.transacciones = data;
    });
  }

  guardarTransaccion() {
    if (!this.nuevaTransaccion.tipo || !this.nuevaTransaccion.montoTransaccion) return;

    this.cajaService.guardarTransaccion(this.nuevaTransaccion).subscribe({
      next: () => {
        this.nuevaTransaccion = {
          montoTransaccion: null,
          tipo: { id: 1 }
        };
        this.cargarTransacciones();
      },
      error: err => alert('Error al guardar')
    });
  }

  volver() {
    this.router.navigate(['/detalle']);
  }
}