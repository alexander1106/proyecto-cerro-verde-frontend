import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CajaService } from '../../services/caja.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-caja-apertura',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './caja-apertura.component.html',
  styleUrls: ['./caja-apertura.component.css']
})
export class CajaAperturaComponent implements OnInit {
  monto: number = 0;
  historial: any[] = [];

  constructor(private cajaService: CajaService, private router: Router) {}

  ngOnInit() {
    this.obtenerHistorial();
  }

  aperturar() {
    if (this.monto <= 0) {
      alert('Por favor ingrese un monto válido');
      return;
    }
    
    this.cajaService.aperturarCaja(this.monto).subscribe({
      next: () => this.router.navigate(['/detalle']),
      error: err => alert('Error al aperturar la caja: ' + (err.error || ''))
    });
  }

  obtenerHistorial() {
    this.cajaService.obtenerHistorial().subscribe(data => {
      this.historial = data as any[];
    });
  }
}