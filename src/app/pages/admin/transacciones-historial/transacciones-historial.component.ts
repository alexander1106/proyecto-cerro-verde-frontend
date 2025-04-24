import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CajaService } from '../../services/caja.service';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-transacciones-historial',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './transacciones-historial.component.html',
  styleUrls: ['./transacciones-historial.component.css']
})
export class TransaccionesHistorialComponent implements OnInit {
  historial: any[] = [];

  constructor(private cajaService: CajaService) {}

  ngOnInit(): void {
    this.cajaService.obtenerTodasLasTransacciones().subscribe((data: any[]) => {
      this.historial = data;
    });
  }
}