import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';
import { Habitacion, HabitacionReserva } from './habitaciones.service';
import { Salones, SalonReserva } from './salones.service';
import { Cliente } from './clientes.service';

export interface Reserva {
  id_reserva?: number;
  fecha_inicio: Date | string;
  fecha_fin: Date | string;
  estado_reserva: string;
  comentarios: string;
  nro_persona: number;
  estado: number;
  cliente: Cliente;
  tipo: string;
  habitacionesXReserva?: HabitacionReserva[];
  salonesXReserva?: SalonReserva[]
}

@Injectable({
  providedIn: 'root'
})
export class ReservasService {
  private apiUrl = 'http://localhost:8080/cerro-verde/recepcion';

  constructor(private http: HttpClient) { }

  getReservas(): Observable<Reserva[]> {
    return this.http.get<Reserva[]>(`${this.apiUrl}/reservas`);
  }
  

  getReservaById(id: number): Observable<Reserva> {
    return this.http.get<Reserva>(`${this.apiUrl}/reservas/${id}`);
  }

  createReserva(reserva: Reserva): Observable<Reserva> {
    return this.http.post<Reserva>(`${this.apiUrl}/reservas`, reserva);
  }

  updateReserva(id: number, reserva: Reserva): Observable<Reserva> {
    return this.http.put<Reserva>(`${this.apiUrl}/reservas/${id}`, reserva);
  }

  cancelarReserva(id: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/cancelar/${id}`, null);
  }  

  deleteReserva(id: number): Observable<string> {
    return this.http.delete<string>(`${this.apiUrl}/reservas/eliminar/${id}`, { responseType: 'text' as 'json' })
      .pipe(
        catchError(error => {
          console.error('Error al eliminar la reserva:', error);
          return throwError(() => new Error('No se pudo eliminar la reserva.'));
        })
      );
  }
  
  
}