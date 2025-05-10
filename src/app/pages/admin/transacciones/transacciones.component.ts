import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CajaService } from '../../../service/caja.service';
import { RouterModule, ActivatedRoute } from '@angular/router'; // 👈 agregado
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
  cajaId: number | null = null; // 👈 nuevo
  nuevaTransaccion = {
    montoTransaccion: null,
    tipo: {
      id: 1
    }
  };

  constructor(
    private cajaService: CajaService,
    private router: Router,
    private route: ActivatedRoute // 👈 nuevo
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      this.cajaId = id ? +id : null;
      this.cargarTransacciones();
    });
  }

  cargarTransacciones() {
    if (this.cajaId) {
      // Transacciones de caja específica
      this.cajaService.obtenerTransaccionesPorCajaId(this.cajaId).subscribe((data: any) => {
        this.transacciones = data;
      });
    } else {
      // Transacciones de caja actual
      this.cajaService.obtenerTransaccionesCajaActual().subscribe((data: any) => {
        this.transacciones = data;
      });
    }
  }

  guardarTransaccion() {
    if (!this.nuevaTransaccion.tipo || !this.nuevaTransaccion.montoTransaccion) return;

    this.cajaService.guardarTransaccion(this.nuevaTransaccion).subscribe({
      next: () => {
        this.nuevaTransaccion = {
          montoTransaccion: null,
          tipo: { id: 1 },
        };
        this.cargarTransacciones();
      },
      error: err => alert('Error al guardar')
    });
  }

  volver() {
    this.router.navigate(['/admin/caja']);
  }
}
