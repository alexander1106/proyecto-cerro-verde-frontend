import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ReservasService, Reserva } from '../../../../../service/reserva.service';
import { HuespedService, HabitacionReservaConHuespedes } from '../../../../../service/huesped.service';

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
  habitacionesReserva: HabitacionReservaConHuespedes[] = [];

  constructor(
    private route: ActivatedRoute,
    private reservasService: ReservasService,
    private huespedService: HuespedService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.loading = true;
  
    this.reservasService.getReservaById(id).subscribe({
      next: (reserva) => {
        this.reserva = reserva;
  
        this.huespedService.getHuespedes().subscribe({
          next: (huespedes) => {
            this.habitacionesReserva = (reserva.habitacionesXReserva ?? []).map(hr => ({
              ...hr,
              huespedes: huespedes.filter(h =>
                h.habres?.id_hab_reserv === hr.id_hab_reserv && h.estado === 1
              )
            }));
          },
          error: () => console.error('Error cargando huéspedes')
        });
        
  
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Error al cargar la reserva: ' + err.message;
        this.loading = false;
      }
    });
  }
}
