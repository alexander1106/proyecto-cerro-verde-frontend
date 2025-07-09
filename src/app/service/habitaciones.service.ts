import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Reserva } from './reserva.service';
import { Pisos } from './pisos.service';
import { TipoHabitacion } from './tipo-habitacion.service';

export interface Sucursal {
  id_sucursal?: number;
  nombre: string;
  estado: number;
}

export interface Habitacion {
  id_habitacion?: number;
  numero: number;
  piso: Pisos;
  estado_habitacion: string;
  estado: number;
  sucursal: Sucursal;
  tipo_habitacion: TipoHabitacion
  };


export interface HabitacionReserva {
  id_hab_reserv?: number;
  habitacion: Habitacion;
  reserva: Reserva;
  precio_reserva:number;
  estado: number;
}

@Injectable({
  providedIn: 'root'
})
export class HabitacionesService {
  private apiUrl = 'http://localhost:8080/cerro-verde/recepcion';

  constructor(private http: HttpClient) { }

  // Habitaciones endpoints
  getHabitaciones(): Observable<Habitacion[]> {
    return this.http.get<Habitacion[]>(`${this.apiUrl}/habitaciones`);
  }

  getHabitacion(id: number): Observable<Habitacion> {
    return this.http.get<Habitacion>(`${this.apiUrl}/habitaciones/${id}`);
  }

  createHabitacion(habitacion: Habitacion): Observable<Habitacion> {
    return this.http.post<Habitacion>(`${this.apiUrl}/habitaciones`, habitacion);
  }

  updateHabitacion(habitacion: Habitacion): Observable<Habitacion> {
    return this.http.put<Habitacion>(`${this.apiUrl}/habitaciones/${habitacion.id_habitacion}`, habitacion);
  }

  deleteHabitacion(id: number): Observable<string> {
    return this.http.delete<string>(`${this.apiUrl}/habitaciones/eliminar/${id}`);
  }

  // HabitacionesXReserva endpoints
  getHabitacionesReserva(): Observable<HabitacionReserva[]> {
    return this.http.get<HabitacionReserva[]>(`${this.apiUrl}/habitacionreservas`);
  }

  createHabitacionReserva(habitacionReserva: HabitacionReserva): Observable<HabitacionReserva> {
    return this.http.post<HabitacionReserva>(`${this.apiUrl}/habitacionreservas`, habitacionReserva);
  }

  updateHabitacionReserva(id: number, habitacionReserva: HabitacionReserva): Observable<HabitacionReserva> {
    return this.http.put<HabitacionReserva>(`${this.apiUrl}/habitacionreservas/${id}`, habitacionReserva);
  }

  deleteHabitacionReserva(id: number) {
    return this.http.delete(`${this.apiUrl}/habitacionreservas/eliminar/${id}`, { responseType: 'text' });
  }

  getEstadosHabitacion(): string[] {
    return ['Disponible', 'Ocupada', 'Reservada', 'Limpieza'];
  }

  getHabitacionesDisponibles(fechaInicio: string, fechaFin: string): Observable<Habitacion[]> {
    return this.http.get<Habitacion[]>(
      `${this.apiUrl}/habitaciones/disponibles?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`
    );
  }

  deleteHabitacionesByReserva(id_reserva: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/reserva/${id_reserva}`);
    }

    
  
}
