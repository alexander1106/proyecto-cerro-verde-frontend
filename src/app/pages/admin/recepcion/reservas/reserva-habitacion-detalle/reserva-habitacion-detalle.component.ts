// reserva-habitacion-detalle.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ReservasService, Reserva } from '../../../../../service/reserva.service';

@Component({
  selector: 'app-reserva-habitacion-detalle',
  templateUrl: './reserva-habitacion-detalle.component.html',
  styleUrls: ['./reserva-habitacion-detalle.component.css'],
  standalone: false
})
export class ReservaHabitacionDetalleComponent implements OnInit {
  reserva: Reserva | null = null;
  loading = false;
  error = '';

  constructor(private route: ActivatedRoute, private reservasService: ReservasService) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.reservasService.getReservaById(id).subscribe(data => {
      this.reserva = data;
      console.log(this.reserva); // Verifica que habitacionesXReserva esté presente
    });
  }

  getReserva(id: number): void {
    this.loading = true;
    this.reservasService.getReservaById(id).subscribe({
      next: (reserva) => {
        this.reserva = reserva;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Error al cargar la reserva: ' + err.message;
        this.loading = false;
      }
    });
  }
}
